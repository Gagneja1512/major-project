const express = require('express')
const rateLimit = require('express-rate-limit')
const AppError = require('./Utils/appError')
const studentRouter = require('./routes/studentRouter')
const teacherRouter = require('./routes/teacherRouter')

const app = express()

const limiter = rateLimit({
    max : 100 ,
    windowMs : 60*60*1000 ,
    message : "To many requests from this IP. Request after some time"
})

app.use('/api' , limiter)

app.use(express.json())

app.use(express.static(`${__dirname}/public`))

app.use((req , res , next) => {
    req.requestTime = new Date().toISOString()
    next()
})

app.use('/api/v1/student' , studentRouter)  
app.use('/api/v1/teachers' , teacherRouter)

app.all('*' , (req , res , next) => {
    next(new AppError(`Can't find ${req.originalUrl}` , 404))
})

module.exports = app