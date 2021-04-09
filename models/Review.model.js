const mongoose = require('mongoose')
require('./User.model')
require('./Product.model')

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: 'Title is required'
    },
    description: {
      type: String,
      required: 'Description is required'
    },
    score: {
      type: Number,
      min: 0,
      max: 5
    },
    product: {
      type: mongoose.Types.ObjectId,
      required: 'A product needs to be referenced',
      ref: 'Product'
    },
    user: {
      type: mongoose.Types.ObjectId,
      required: 'A user needs to be referenced',
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = doc._id
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review