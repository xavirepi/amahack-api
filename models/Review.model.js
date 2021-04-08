const mongoose = require('mongoose')
const Product = require('./Product.model')
const User = require('./User.model')

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
      type: mongoose.Schema.Types.ObjectId,
      required: 'A product needs to be referenced',
      ref: Product.modelName
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: 'A user needs to be referenced',
      ref: User.modelName
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