const createError = require('http-errors')
const Product = require('../models/Product.model')

module.exports.list = (req, res, next) => {
  // Some filters are applied to render products
  const criteria = {}
  const { category, search } = req.query

  if (search) {
    criteria.name = new RegExp(search, 'i')
  }

  if (category) {
    criteria.categories = { '$in': [category] }
  }

  Product.find(criteria) // .find with the filtered products
    .then(products => res.json(products))
    .catch(next)
}

module.exports.get = (req, res, next) => { // Returns a specific product
  Product.findById(req.params.id)
    .then(product => {
      if (!product) {
        next(createError(404, 'Product not found')) // Throws and exception if the product hasn't been found
      } else {
        res.json(product)
      }
    })
    .catch(next)
}

module.exports.create = (req, res, next) => {
  Product.create(req.body)
    .then(product => res.status(201).json(product))
    .catch(next)
}

// TODO: delete

// TODO: update

// TODO: create review

// TODO: delete review