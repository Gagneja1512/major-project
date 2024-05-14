const AppError = require('../Utils/appError');
const Student = require('./../models/studentModel')
const catchAsync = require('./../Utils/catchAsync')


const filteredObj = (obj , ...allowedFields) => {
    const newObject = {}
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)){
            newObject[el] = obj[el]
        }
    })

    return newObject
}

exports.getAllStudents = catchAsync(async (req, res , next) => {
    const students = await Student.find() ;
    
    res.status(200).json({
        status : 'sucess' , 
        results : students.length , 
        data : {
            students
        }
    })
})

exports.updateMe = catchAsync(async(req , res , next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError("Update password is not here , go :)"))
    }

    const filteredBody = filteredObj(req.body , 'name' , 'email')
    const updatedStudent = await Student.findByIdAndUpdate(req.student.id  , filteredBody , {
        new : true ,
        runValidators : true
    })
    res.status(200).json({
        status : "success" ,
        data : {
            updatedStudent
        }
    })
})

exports.deleteMe = catchAsync(async (req , res , next) => {
    await Student.findByIdAndUpdate(req.student.id , {active : false})

    res.status(204).json({
        status : "success" , 
        data : null
    })
})

exports.getStudent = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}

exports.createStudent = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}

exports.updateStudent = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}

exports.deleteStudent = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route has not been made yet!!!"
    })
}