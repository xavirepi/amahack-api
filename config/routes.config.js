const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller')
const productsController = require('../controllers/products.controller')

// Users routes
router.post('/users', usersController.create)

// Products routes
router.get('/products', productsController.list)
router.post('/products', productsController.create)
router.get('/products/:id', productsController.get)
// router.delete('/products/:id', productsController.delete)
// router.put('/products/:id', productsController.update)

module.exports = router;