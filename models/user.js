const mongoose = require('mongoose')
// const SchemaTypes = mongoose.Schema.Types;

const simpleSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  isBuyable: { type: Boolean, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isCheap: { type: Boolean, required: true }
})

const productSchema = new mongoose.Schema({
  isAvailable: { type: Boolean, required: true },
  discount: { type: String, required: true },
  isBuyable: { type: Boolean, required: true },
  reviews: { type: Number, required: true },
  variationSelection: { type: Boolean, required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  minPrice: { type: Number, required: true },
  stars: { type: Number, required: true, min: 0, max: 5 },
  isCheap: { type: Boolean, required: true },
  date: { type: Date, required: true, default: Date.now },
  isSimpleSelected: { type: Boolean, required: true, default: false },
  simpleSelected: { type: String, required: false },
  simples: [simpleSchema]
})

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profileImageUrl: { type: String, required: true },
  jumiaProducts: [productSchema]
})

module.exports = mongoose.model('User', userSchema)