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
      validate: { // Mongoose method to validate images
        validator: value => { // A value is passed
          try {
            const url = new URL(value)

            return url.protocol === 'http:' || url.protocol === 'https:' // If the value doesn't start like this most probably it won't be an image
          } catch(err) {
            return false
          }
        },
        message: () => 'Invalid image URL' // This message is returned
      }
    },
    address: {
      type: String,
      required: 'Address is required'
    }
  },
  {
    timestamps: true,  
    toJSON: { // As our API will be returninn JSONs this method is used to transform what we get from the DB to JSON format. When res.status.json is used this function is executed
      virtuals: true, // We tell the method to add virtuals to what we get from the DB
      transform: (doc, ret) => { // Params: doc = placeholder of document and ret = placeholder of returned value - Function used to transform what we get from the DB 
        ret.id = doc._id // "id" field is created and substitutes "_id" filed --> Better to work with it
        delete ret._id // "_id" key is deleted
        delete ret.__v // "__v" keys is deleted (it's not useful)
        delete ret.password // So the password is not sent to the Front
        return ret // This is the transformed object that will get to the Front
      } // Delete is JS --> Used to delete keys from objects
    }
  }
)

// Used to hash passwords. Pre returns a promise and 'save' inserts this new document into the DB. This all happens before anything is send to the DB.
userSchema.pre('save', function(next) { // We add function to be able to use "this" inside. All the schema values are accessed through this
  if (this.isModified('password')) { // Checks whether the password has been modified
    bcrypt.hash(this.password, SALT_WORK_FACTOR) // The password we get from the "this" is passed and SALT is the number of rounds we want it to be hashed.
      .then(hash => { // A promise is returnred and it returns a hash
        this.password = hash // The password in the model is subsituted by the hash.
        next()
      })
  } else {
    next() // In case the password is not modified just continue the middleware chain
  }
})

// Static method -- Methods that are created and added to the model so they can be executed later on
userSchema.methods.checkPassword = function (passwordToCheck) { // Method used to check password - Takes a password to be compared as an argument
  return bcrypt.compare(passwordToCheck, this.password); // bcrypt method is used to compare the argument against the current hashed password in the model
}; // bcrypt.compare methud returns a promise 

// Vitruals - Used to reference other models inside the current model
userSchema.virtual('reviews', {
  ref: Review.modelName, // Just the name of the model. modelName is just a way to get the model name to avoid hard typing it.
  localField: '_id', // What's the name of the field to be compared in the current model. In this case "_id"
  foreignField: 'user' // How this model appears in the "ref" model. In this case how user appears in "review model"
})

// Basically we're specifying how "user" is going to appear in "reviews" and "products" models
userSchema.virtual('products', {
  ref: Product.modelName,
  localField: '_id',
  foreignField: 'user'
})

const User = mongoose.model('User', userSchema) // Actual generation of model

module.exports = User // Exports model