if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const User = require('./models/user')
const mongoose = require('mongoose')
const axios = require('axios')
const sgMail = require('@sendgrid/mail')
const SERVER_REFRESH_TIME = 60000
const { html } = require('./email/html')

mongoose.connect(process.env.URI, { useNewUrlParser: true })
const db = mongoose.connection
db.once('open', () => console.log('connected to the database!'))

sgMail.setApiKey(process.env.SENDGRID_API);

const updateProducts = (googleId, productId, infoList) => {
  if (infoList.isAvailable) {
    User.findOneAndUpdate({ 'googleId': googleId, "jumiaProducts._id": productId }, {
      $set:
      {
        "jumiaProducts.$.isAvailable": infoList.isAvailable,
        "jumiaProducts.$.discount": infoList.discount,
        "jumiaProducts.$.isBuyable": infoList.isBuyable,
        "jumiaProducts.$.reviews": infoList.reviews,
        "jumiaProducts.$.variationSelection": infoList.variationSelection,
        "jumiaProducts.$.simples": infoList.simples,
        "jumiaProducts.$.url": infoList.url,
        "jumiaProducts.$.price": infoList.price,
        "jumiaProducts.$.imageUrl": infoList.imageUrl,
        "jumiaProducts.$.title": infoList.title,
        "jumiaProducts.$.isCheap": infoList.isCheap,
        "jumiaProducts.$.stars": infoList.stars
      }
    }, (err, data) => {
      if (err) console.log('err : ', err)
      // console.log(data)
      const product = data.jumiaProducts.filter(pro => pro._id.toString() === productId)[0]
      if (product.isSimpleSelected) {
        const oldSimpleSelected = product.simples.filter(simple => simple.sku === product.simpleSelected)[0]
        const newSimpleSelected = infoList.simples.filter(simple => simple.sku === product.simpleSelected)[0]
        // console.log("simple selected", oldSimpleSelected.isCheap, newSimpleSelected.isCheap)
        if (!oldSimpleSelected.isCheap && newSimpleSelected.isCheap) {
          sendEmail(data.email, data.name, product.minPrice, newSimpleSelected.price, infoList.title, infoList.imageUrl)
        }
      } else {
        // console.log("no simple selected", product.isCheap, infoList.isCheap)
        if (!product.isCheap && infoList.isCheap) {
          sendEmail(data.email, data.name, product.minPrice, infoList.price, infoList.title, infoList.imageUrl)
        }
      }
    })
  } else {
    console.log("is not available")
    User.findOneAndUpdate({ 'googleId': googleId, "jumiaProducts._id": productId }, { $set: { "jumiaProducts.$.isAvailable": infoList.isAvailable } }, (err, data) => {
      if (err) console.log('err : ', err)
    })
  }
}

const getProductInfo = async (productUrl, minPrice) => {
  try {
    const data = await axios.get(productUrl)
      .then(res => res.data)
    // .catch(err => console.error("catch error ", err.message))
    const json = JSON.parse(data.split('</script><script>window.__STORE__=')[1].split(';</script><script')[0])
    const view = json.view
    if (view !== 'Product') {
      return { isAvailable: false }
    }
    const price = Number(json.products[0].prices.rawPrice)
    const discount = json.products[0].prices.discount || "0%"
    const title = json.products[0].displayName
    const isBuyable = json.products[0].isBuyable
    const url = `https://www.jumia.ma${json.products[0].url}`
    const imageUrl = json.products[0].image.replace('300x300', '680x680')
    const stars = json.products[0].rating.average || 0
    const reviews = json.products[0].rating.totalRatings || 0
    const isCheap = minPrice >= price
    const variationSelection = json.products[0].variationSelection || false
    const bSimples = json.products[0].simples || []
    const simples = []
    for (const bSimple of bSimples) {
      simples.push({ sku: bSimple.sku, isBuyable: bSimple.isBuyable, name: bSimple.name, price: Number(bSimple.prices.rawPrice), isCheap: (minPrice >= Number(bSimple.prices.rawPrice)) })
    }
    return { isAvailable: true, isCheap, price, discount, title, isBuyable, url, imageUrl, stars, reviews, variationSelection, simples }
  } catch (err) {
    // console.log(err.message)
    return { isAvailable: false }
  }
}

const sendEmail = (email, name = "", minPrice = "", currentPrice = "", productTitle = "", imageUrl = "") => {
  const htmlMsg = html(name, minPrice, currentPrice, productTitle, imageUrl)
  const msg = {
    to: email,
    from: {
      name: '💲 Jumia Price Tracker',
      email: 'ayoubdya@gmail.com'
    },
    subject: '📉 Product Price Decrease',
    text: htmlMsg,
    html: htmlMsg,
  }
  sgMail.send(msg)
    .then(_ => console.log(`Email sent to ${email} :)`))
    .catch(err => console.log(err.message))
}

const dbRefresh = setInterval(() => {
  console.log('updating ......')
  User.find((err, data) => {
    if (err) console.log(err)
    for (const user of data) {
      for (const product of user.jumiaProducts) {
        getProductInfo(product.url, product.minPrice)
          .then(infoList => updateProducts(user.googleId, product._id.toString(), infoList))
      }
    }
  })
}, SERVER_REFRESH_TIME)