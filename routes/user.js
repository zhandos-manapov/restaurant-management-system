require('dotenv').config()
const express = require('express')
const connection = require('../connection')
const router = express.Router()
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')


router.post('/signup', (req, res) => {
	const user = req.body
	let query = 'select email, password, role, status from user where email=?'
	connection.query(query, [user.email], (err, result) => {
		if (!err) {
			if (result.length <= 0) {
				query = "insert into user(name, contactNumber, email, password, status, role) values(?,?,?,?,'false', 'user')"
				connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, result) => {
					if (!err) {
						return res.status(200).json({ message: 'Successfully registed' })
					} else {
						return res.status(500).json(err)
					}
				})
			} else {
				return res.status(500).json({ message: 'Email already exists.' })
			}
		} else {
			return res.status(500).json(err)
		}
	})
})


router.post('/login', (req, res) => {
	const user = req.body
	let query = "select email, password, role, status from user where email=?"
	connection.query(query, [user.email], (err, result) => {
		if (!err) {
			if (result.length <= 0 || result[0].password != user.password) {
				return res.status(401).json({ message: 'Incorrect username or password.' })
			} else if (result[0].status === 'false') {
				return res.status(401).json({ message: 'Wait for admin approval' })
			} else if (result[0].password == user.password) {
				const response = {
					email: result[0].email,
					role: result[0].role,
				}
				const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
				res.status(200).json({ token: accessToken })
			} else {
				return res.status(400).json({ message: 'Something wend wrong. Please try again.' })
			}
		} else {
			return res.status(500).json(err)
		}
	})
})


const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}
})

router.post('/forgotPassword', (req, res) => {
	const user = req.body
	let query = "select email, password from user where email=?"
	connection.query(query, [user.email], (err, result) => {
		if (!err) {
			if (result.length <= 0) {
				return res.status(200).json({ message: 'Password successfully to your email.' })
			} else {
				let mailOptions = {
					from: process.env.EMAIL,
					to: result[0].email,
					subject: 'Password by Cafe Management System',
					html:
						`<p>
              <b>Your login details for Cafe Management System</b>
              <br>
              <b>Email: ${result[0].email}</b>
              <br>
              <b>Password: ${result[0].password}</b>
              <br>
              <a href="http://${process.env.HOST}:${process.env.PORT}">
            </p>`
				}
				transporter.sendMail(mailOptions, (err, data) => {
					if (err) {
						console.log(err);
					} else {
						console.log(`Email sent: ${data.response}`)
					}
				})
				return res.status(200).json({ message: 'Password successfully to your email.' })
			}
		} else {
			return res.status(500).json(err)
		}
	})
})


module.exports = router;