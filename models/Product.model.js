const mongoose = require('mongoose')
const Review = require('./Review.model')
const User = require('./User.model')

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
    image: {
      type: String,
      required: 'Image is required',
      validate: {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: 'A user needs to be referenced',
      ref: User.modelName
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

productSchema.virtual('reviews', {
  ref: Review.modelName,
  localField: '_id',
  foreignField: 'product'
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product