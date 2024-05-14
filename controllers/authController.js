const { promisify } = require('util')
const Student = require('./../models/studentModel')
const catchAsync = require('./../Utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../Utils/appError')

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

const createSendToken = (student, statusCode, res) => {
    const token = signToken(student._id)

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    // To not send the password after signup
    student.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            student: student
        }
    })
}


exports.signup = catchAsync(async (req, res, next) => {

    const newStudent = await Student.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    })

    console.log(newStudent)

    createSendToken(newStudent , 201 , res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    //If email and password exists
    if (!email || !password) {
        return next(new AppError("Please Provide email and Password", 400))
    }

    // Check if student exists and password is correct
    const student = await Student.findOne({ email }).select('+password')

    if (!student || !(await student.correctPassword(password, student.password))) {
        return next(new AppError("Incorrect email or password", 401))
    }

    // If everything is ok then send token to the client.
    const token = signToken(student._id)
    res.status(200).json({
        status: 'success',
        token
    })
})