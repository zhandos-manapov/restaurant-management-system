const mysql = require('mysql')
require('dotenv').config()

let connection = mysql.createConnection({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

connection.connect((err) => {
  err
    ? console.log(err)
    : console.log('Connected')
})

module.exports = connection