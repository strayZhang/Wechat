const reply=require('./reply')

var express = require('express')


const app = express()

app.use(reply())

app.listen(3000, function() {
    console.log('running ..........')
})