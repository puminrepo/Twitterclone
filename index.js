const express = require('express')
const app = express()
const routes = require('./routes/routes.js')
const cookieParser = require('cookie-parser')
app. use(cookieParser())
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public/'))
 
app.use(routes)

app.listen(8008) 