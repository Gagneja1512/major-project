const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const studentSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , 'Please tell us your name']
    } ,
    email : {
        type : String ,
        required : [true , 'Please provide your email'] , 
        unique : true ,
        lowercase : true ,
        validate : [validator.isEmail , 'Please provide a valid email']
    } , 
    Branch : {
        type : String , 
        required : [true , "Please enter your branch"]
    } , 

    verified : {
        type : Boolean , 
        default : false 
    }, 

    role : {
        type : String ,
        enum : ['student' , 'teacher'] , 
        default : 'student'
    } ,
    password : {
        type : String ,
        required : [true , 'Please provide password'] ,
        minLength : 8 , 
        select : false
    } ,
    passwordConfirm : {
        type : String ,
        required : [true , 'Please confirm your password'] ,
        validate : {
            //This validator works only on the CREATE and SAVE method not update etc...
            validator : function(element){
                return element === this.password
            } , 
            message : "Passwords are not same "
        }
    } , 
    passwordChangedAt : {
        type :Date
    } , 
    passwordResetToken : {
        type : String
    } , 
    passwordResetExpires : {
        type : Date
    } , 
    active : {
        type : Boolean , 
        select : false , 
        default : true
    }
})

studentSchema.pre(/^find/ , function(next) {
    //this points to current query
    this.find({active : {$ne : false}})
    next()
})

studentSchema.pre('save' , async function(next){
    //Only run when the password is actually modified
    if(!this.isModified('password')) 
        return next() ;

    this.password = await bcrypt.hash(this.password , 12)  ;
    this.passwordConfirm = undefined ;
    next()  ;
})

studentSchema.methods.correctPassword = async function(candidatePassword , userPassword) {
    return await bcrypt.compare(candidatePassword , userPassword)
}

studentSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000 , 10)

        console.log(changedTimestamp , JWTTimeStamp)
        return JWTTimeStamp < changedTimestamp
    }

    return false 
}

studentSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10*60*1000

    return resetToken
}

studentSchema.pre('save' , function(next){
    if(!this.isModified('password') || this.isNew){
        return next()
    }

    this.passwordChangedAt =  Date.now() - 1000 //sometimes the jwt made before change the password therefore we subtract 1 sec to be clear in the issue tht the password chaned at property is nearly less than the jwt sign timestamp
    next()
})

const Student = mongoose.model('Student' , studentSchema)

module.exports = Student