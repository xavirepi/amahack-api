const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Review = require('./Review.model')
const Product = require('./Product.model')

const EMAIL_PATTERN = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const SALT_WORK_FACTOR = 10;

const userSchema = mongoose.Schema(
  {
    email: {
      unique: true,
      type: String,
      required: 'Email is required',
      match: [EMAIL_PATTERN, 'Email is not valid']
    },
    password: {
      type: String,
      required: 'Password is required',
      minLength: [8, 'Password must have 8 characters or more']
    },
    name: {
      type: String,
      required: 'Name is required'
    },
    image: {
      type: String,
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
    address: {
      type: String,
      required: 'Address is required'
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
        delete ret.password
        return ret
      }
    }
  }
)

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    bcrypt.hash(this.password, SALT_WORK_FACTOR)
      .then(hash => {
        this.password = hash
        next()
      })
  } else {
    next()
  }
})

userSchema.methods.checkPassword = function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
};

userSchema.virtual('reviews', {
  ref: Review.modelName,
  localField: '_id',
  foreignField: 'user'
})

userSchema.virtual('products', {
  ref: Product.modelName,
  localField: '_id',
  foreignField: 'user'
})

const User = mongoose.model('User', userSchema)

module.exports = User