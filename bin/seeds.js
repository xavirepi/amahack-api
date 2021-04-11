const mongoose = require('mongoose')
const faker = require('faker')

const User = require('../models/User.model')
const Product = require('../models/Product.model')

const categories = require('../constants/categories')

require('../config/db.config') // The DB configuration is required so when the seeds is executed it's connected to mongoose


// Seeds that generates 10 users and 20 products
mongoose.connection.once('open', () => { // connection.once is like a listener that is used to specify what has to happen once the connection to the DB is created
  console.info(`*** Connected to the database ${mongoose.connection.db.databaseName} ***`);

  mongoose.connection.db.dropDatabase() // Recommended method to delete the DB when the seeds is executed
    .then(() => console.log('Database clear'))
    .then(() => {
      const users = []

      for (let index = 0; index < 10; index++) {
        users.push({ // Creates a user whose fields match the user model mandatory fields. The fields are generated with faker package.
          email: faker.internet.email(),
          password: '12345678',
          name: faker.name.findName(),
          address: faker.address.streetName(),
          image: faker.internet.avatar()
        })
      }

      return User.create(users) // Mongoose method user create that takes an array of objects and creates an instance of the model and save it to the DB for each of the objects (read users in this case)
      // User.create returns a promise and whenever we user "return" with a promise the value is passed to the following .then()
    })
    .then(users => { // The previous promise resolution is sent to the param of the following .then()
      console.log(`${users.length} users created`)

      const products = []

      for (let index = 0; index < 20; index++) {
        products.push({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(),
          image: faker.image.image(),
          user: users[Math.floor(index / 2)]._id, // Used to generate 2 products for each user
          categories: [categories[Math.floor(Math.random() * categories.length)]]
        })
      }

      return Product.create(products)
    })
    .then(products => {
      console.log(`${products.length} products created`)
    })
    .then(() => console.info(`- All data created!`))
    .catch(error => console.error(error))
    .finally(() => process.exit(0)) // Finally is executed no matter the promise goes through .then() or .catch() and .exit just closes the terminal
})
