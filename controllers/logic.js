const User = require('../models/user')
const axios = require('axios')
const admin = require("firebase-admin")
// const cheerio = require('cheerio')

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "jumiapricetracker"
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

const auth = admin.auth()

const getUserById = async (req, res, next) => {
  let user
  try {
    result = await auth.verifyIdToken(req.headers.authorization)
    try {
      user = await User.findOne({ googleId: result.uid })
      if (!user) {
        userInputs = { googleId: result.uid, name: result.name, email: result.email, profileImageUrl: result.picture }
        try {
          user = new User(userInputs)
          const newUser = await user.save()
          // return res.status(201).json(newUser)
        } catch (err) {
          return res.status(400).json({ error: err.message })
        }
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  res.user = user
  res.result = result
  next()
}

const getUser = async (req, res) => {
  res.status(200).json(res.user)
}

const getProduct = async (req, res) => {
  try {
    await axios.get(req.body.url)
      .then(result => {
        const json = JSON.parse(result.data.split('</script><script>window.__STORE__=')[1].split(';</script><script')[0])
        const view = json.view
        if (view !== 'Product') res.status(404).json({ isAvailable: false })
        const price = Number(json.products[0].prices.rawPrice)
        const discount = json.products[0].prices.discount || "0%"
        const title = json.products[0].displayName
        const isBuyable = json.products[0].isBuyable
        const url = `https://www.jumia.ma${json.products[0].url}`
        const imageUrl = json.products[0].image.replace('300x300', '680x680')
        const stars = json.products[0].rating.average || 0
        const reviews = json.products[0].rating.totalRatings || 0
        const isCheap = req.body.minPrice >= price
        const variationSelection = json.products[0].variationSelection || false
        const bSimples = json.products[0].simples || []
        let simples = []
        for (let i = 0; i < bSimples.length; i++) {
          simples.push({ sku: bSimples[i].sku, isBuyable: bSimples[i].isBuyable, name: bSimples[i].name, price: Number(bSimples[i].prices.rawPrice), isCheap: (req.body.minPrice >= Number(bSimples[i].prices.rawPrice)) })
        }
        res.status(200).json({ isAvailable: true, minPrice: req.body.minPrice, isCheap, price, discount, title, isBuyable, url, imageUrl, stars, reviews, variationSelection, simples })
      })
      .catch(err => res.status(400).json({ error: err.message }))
  } catch (err) {
    console.log('logic error : ', err)
    res.status(500).json({ error: err })
  }
}

const patchSelectedSimple = async (req, res) => {
  try {
    User.findOneAndUpdate({ 'googleId': res.result.uid, 'jumiaProducts._id': req.body.id }, { $set: { "jumiaProducts.$.isSimpleSelected": true, "jumiaProducts.$.simpleSelected": req.body.option } }, (err, data) => {
      if (err) return res.status(400).json({ error: 'error in patching the product option' });
    })
    res.status(200).json({ message: "simple patched" });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ error: err.message })
  }
}

const patchProduct = async (req, res) => {
  try {
    User.findOneAndUpdate(
      { googleId: res.result.uid },
      { $set: { "jumiaProducts.$[product].minPrice": req.body.minPrice, "jumiaProducts.$[product].isCheap": req.body.isCheap } },
      { arrayFilters: [{ "product._id": req.body.id }] },
      (err, data) => {
        if (err) return res.status(500).json({ error: 'error in patching minPrice of the product' });
        const simples = data.jumiaProducts.filter(pro => pro._id.toString() === req.body.id)[0].simples
        for (const simple of simples) {
          const sku = simple.sku
          const isCheap = req.body.minPrice >= simple.price
          User.findOneAndUpdate(
            { googleId: res.result.uid },
            { $set: { "jumiaProducts.$[product].simples.$[simple].isCheap": isCheap } },
            { arrayFilters: [{ "simple.sku": sku }, { "product._id": req.body.id }] },
            (err, data) => {
              if (err) return res.status(500).json({ error: 'error in patching minPrice of the product samples' });
            })
        }
        // User.findOne({ googleId: res.result.uid }, (err, data) => {
        //   if (err) return res.status(500).json({ error: 'error in getting updated info' });
        //   res.status(200).json(data)
        // })
      })
    res.status(200).json({ message: "patched" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const pushProduct = async (req, res) => {
  try {
    User.findOneAndUpdate({ 'googleId': res.result.uid }, { $push: { 'jumiaProducts': { ...req.body.push } } }, { new: true }, (err, data) => {
      if (err) return res.status(400).json({ error: 'error in pushing product' });
      res.status(200).json(data);
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const pullProduct = async (req, res) => {
  try {
    User.findOneAndUpdate({ 'googleId': res.result.uid }, { $pull: { 'jumiaProducts': { '_id': req.body.id } } }, { new: true }, (err, data) => {
      if (err) return res.status(400).json({ error: 'error in pulling product' })
      res.status(200).json(data);
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getProduct,
  getUser,
  getUserById,
  pullProduct,
  patchProduct,
  pushProduct,
  patchSelectedSimple
}