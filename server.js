const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const morgan =require('morgan')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const route = require('./src/routes')
const db =require('./src/config/db')

const app = express()

db.connect()

app.use(methodOverride('_method'))
app.use(bodyParser.json({limit:"50mb"}))
const whitelist = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5500']
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if(!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)     
    }
    else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(morgan('common'))
app.use(bodyParser.urlencoded({ extended: true }))

const PORT = process.env.PORT || 2000

route(app)

app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`)
})
