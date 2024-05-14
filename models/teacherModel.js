const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const teacherSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : [true , "Please fill the name of the teacher"]
    } , 

    email : {
        type : String , 
        required : [true , "Please insert an email"] , 
        unique : true , 
        lowercase : true , 
        validate : [validator.isEmail , 'Please provide a valid email']
    } , 

    password : {
        type : String , 
        required : [true , 'Please fill in the password'] , 
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
    }  , 

    passwordChangedAt : {
        type :Date
    } , 
    passwordResetToken : {
        type : String
    } , 
    passwordResetExpires : {
        type : Date
    } , 

})


teacherSchema.pre(/^find/ , function(next) {
    //this points to current query
    this.find({active : {$ne : false}})
    next()
})

teacherSchema.pre('save' , async function(next){
    //Only run when the password is actually modified
    if(!this.isModified('password')) 
        return next() ;

    this.password = await bcrypt.hash(this.password , 12)  ;
    this.passwordConfirm = undefined ;
    next()  ;
})

teacherSchema.methods.correctPassword = async function(candidatePassword , userPassword) {
    return await bcrypt.compare(candidatePassword , userPassword)
}

teacherSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000 , 10)

        console.log(changedTimestamp , JWTTimeStamp)
        return JWTTimeStamp < changedTimestamp
    }

    return false 
}

teacherSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10*60*1000

    return resetToken
}

teacherSchema.pre('save' , function(next){
    if(!this.isModified('password') || this.isNew){
        return next()
    }

    this.passwordChangedAt =  Date.now() - 1000 //sometimes the jwt made before change the password therefore we subtract 1 sec to be clear in the issue tht the password chaned at property is nearly less than the jwt sign timestamp
    next()
})

const Teacher = mongoose.model('Teacher' , teacherSchema)

module.exports = Teacher