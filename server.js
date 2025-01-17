const mongoose = require('mongoose')


process.on('uncaughtException' , err => {
    console.log(err.name , err.message)
    process.exit(1)
})

const dotenv = require('dotenv')
dotenv.config({path : './config.env'})

const app = require('./app')
const DB = process.env.DATABASE.replace('<password>' , process.env.DATABASE_PASSWORD)
mongoose.connect(DB , {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log("Connection Successfull")
}) 

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})

process.on('unhandledRejection' , err => {
    console.log(err.name , err.message)
    server.close(() => {
        process.exit(1) //1 For uncaught exceptions and 0 for alright 
    })
})