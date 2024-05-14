const { promisify } = require('util')
const Teacher = require('./../models/teacherModel')
const catchAsync = require('./../Utils/catchAsync')
const jwt = require('jsonwebtoken')
const AppError = require('./../Utils/appError')

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

const createSendToken = (teacher, statusCode, res) => {
    const token = signToken(teacher._id)

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    // To not send the password after signup
    teacher.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            teacher: teacher
        }
    })
}


exports.signup = catchAsync(async (req, res, next) => {

    const newTeacher = await Teacher.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    })

    console.log(newTeacher)

    createSendToken(newTeacher , 201 , res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    //If email and password exists
    if (!email || !password) {
        return next(new AppError("Please Provide email and Password", 400))
    }

    // Check if Teacher exists and password is correct
    const teacher = await Teacher.findOne({ email }).select('+password')

    if (!teacher || !(await teacher.correctPassword(password, teacher.password))) {
        return next(new AppError("Incorrect email or password", 401))
    }

    // If everything is ok then send token to the client.
    const token = signToken(teacher._id)
    res.status(200).json({
        status: 'success',
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    //Checking Token whether it is there
    let token;

    console.log(req.headers)

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        // console.log(token);
    }

    console.log(token);
    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access'), 401)
    }

    // verification Token
    const decoded = await promisify(jwt.verify)(token , process.env.JWT_SECRET)
    console.log(decoded)

    //Check if the teacher exists
    const freshTeacher = await Teacher.findById(decoded.id)
    if (!freshTeacher) {
        return next(new AppError("The teacher belonging to this token does not exist", 401))
    }

    //Check if teacher changed the password after the token was issued
    if (freshTeacher.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('teacher recently Changed the password', 401))
    }

    //grant access to the next route
    req.teacher = freshTeacher
    next()
})