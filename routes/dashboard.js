const express = require('express')
const connection = require('../connection')
const router = express.Router()
const auth = require('../services/authentication')


router.get('/details', auth.authenticateToken, (req, res) => {
  let categoryCount, productCount, billCount
  let query = 'select count(id) as categoryCount from category'
  connection.query(query, (err, result) => {
    if (!err) {
      categoryCount = result[0].categoryCount
    } else {
      return res.status(500).json(err)
    }
  })

  query = 'select count(id) as productCount from product'
  connection.query(query, (err, result) => {
    if (!err) {
      productCount = result[0].productCount
    } else {
      return res.status(500).json(err)
    }
  })

  query = 'select count(id) as billCount from bill'
  connection.query(query, (err, result) => {
    if (!err) {
      billCount = result[0].billCount
      const data = {
        categoryCount,
        productCount,
        billCount
      }
      return res.status(200).json(data)
    } else {
      return res.status(500).json(err)
    }
  })
})


module.exports = router