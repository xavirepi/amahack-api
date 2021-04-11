const mongoose = require('mongoose')
const categories = require('../constants/categories') // Categories is exported to an external directory so it's more practical if they're updated in the future

require('./Review.model')
require('./User.model')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: 'Name is required'
    },
    description: {
      type: String,
      required: 'Description is required',
      minLength: [10, 'Description needs at least 10 characters']
    },
    price: {
      type: Number,
      required: 'Price is required'
    },
    categories: {
      type: [String],
      enum: categories // If a passed category is not included in the "enum" the field won't be valid (Imported from "constants" directory)
    },
    image: {
      type: String,
      required: 'Image is required',
      validate: { // Check notes on validation in "image" field in "User" model
        validator: value => {
          try {
            const url = new URL(value)

            return url.protocol === 'http:' || url.protocol === 'https:'
          } catch(err) {
            return false
          }
        },
        message: () => 'Invalid image URL'
      }
    },
    user: { // The user who created the product
      type: mongoose.Types.ObjectId,
      required: 'A user needs to be referenced',
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = doc._id
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

// Virtual specifying how the product is going to appear in the review model
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product