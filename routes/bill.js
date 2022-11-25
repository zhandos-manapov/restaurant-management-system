const express = require('express')
const connection = require('../connection')
const router = express.Router()
const ejs = require('ejs')
const pdf = require('html-pdf')
const uuid = require('uuid')
const auth = require('../services/authentication')
const path = require('path')
const fs = require('fs')


router.patch('/update', auth.authenticateToken, (req, res) => {
  const orderDetails = req.body
  const productDetails = JSON.parse(orderDetails.productDetails)
  let query = 'update bill set name=?, email=?, contactNumber=?, paymentMethod=?, total=?, productDetails=? where id=?'
  const params = [orderDetails.name, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.total, orderDetails.productDetails, orderDetails.id]
  connection.query(query, params, (err, result) => {
    if (!err) {
      if (result.affectedRows == 0)
        return res.status(404).json({ message: 'Bill id was not found.' })
      return res.status(200).json({ message: 'Bill updated successfully.' })
    } else {
      return res.status(500).json(err)
    }
  })
})


router.post('/generateReport', auth.authenticateToken, (req, res) => {
  const genUuid = uuid.v1()
  const orderDetails = req.body
  const productDetailsReport = JSON.parse(orderDetails.productDetails)

  let query = `insert into bill(name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?,?,?,?,?,?,?,?)`

  const params = [orderDetails.name, genUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.total, orderDetails.productDetails, res.locals.email]

  connection.query(query, params, (err, result) => {
    if (!err) {
      ejs.renderFile(path.join(__dirname, '', 'report.ejs'), {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount,
      }, (err, data) => {
        if (!err) {
          pdf.create(data).toFile(`./generated_pdf/${genUuid}.pdf`, (err, data) => {
            if (!err) {
              return res.status(200).json({ uuid: genUuid })
            } else {
              return res.status(500).json(err)
            }
          })
        } else {
          return res.status(500).json(err)
        }
      })
    } else {
      return res.status(500).json(err)
    }
  })
})


router.post('/getPdf', auth.authenticateToken, (req, res) => {
  const orderDetails = req.body
  const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`
  if (fs.existsSync(pdfPath)) {
    res.contentType('application/pdf')
    fs.createReadStream(pdfPath).pipe(res)
  } else {
    let productDetailsReport = JSON.parse(orderDetails.productDetails)
    ejs.renderFile(path.join(__dirname, '', 'report.ejs'), {
      productDetails: productDetailsReport,
      name: orderDetails.name,
      email: orderDetails.email,
      contactNumber: orderDetails.contactNumber,
      paymentMethod: orderDetails.paymentMethod,
      totalAmount: orderDetails.totalAmount,
    }, (err, data) => {
      if (!err) {
        pdf.create(data).toFile(`./generated_pdf/${orderDetails.uuid}.pdf`, (err, data) => {
          if (!err) {
            res.contentType('application/pdf')
            fs.createReadStream(pdfPath).pipe(res)
          } else {
            return res.status(500).json(err)
          }
        })
      } else {
        return res.status(500).json(err)
      }
    })
  }
})


router.get('/getBills', auth.authenticateToken, (req, res) => {
  let query = 'select * from bill order by id desc'
  connection.query(query, (err, result) => {
    if (!err) {
      return res.status(200).json(result)
    } else {
      return res.status(500).json(err)
    }
  })
})

router.delete('/delete/:id', (req, res) => {
  const id = req.params.id
  let query = 'delete from bill where id=?'
  connection.query(query, [id], (err, result) => {
    if (!err) {
      if (result.affectedRows == 0) {
        return res.status(404).json({ message: 'Bill id was not found.' })
      }
      return res.status(200).json({ message: 'Bill deleted successfully.' })
    } else {
      return res.status(500).json(err)
    }
  })
})


module.exports = router