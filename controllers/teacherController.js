const AppError = require('../Utils/appError');
const Student = require('./../models/studentModel')
const catchAsync = require('./../Utils/catchAsync')
const Teacher = require('./../models/teacherModel')

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

exports.getStudent = catchAsync(async (req, res, next) => {

    const student = await Student.findById(req.params.id)

    if (!student) {
        return next(new AppError('No student found with that ID', 404))
    }

    res.status(200).json({
        status: "Sucess",
        data: {
            student
        }
    })
})


exports.updateStudentVerify = catchAsync(async (req, res, next) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!student) {
        return next(new AppError('No student found with that ID', 404))
    }

    res.status(200).json({
        status: "success",
        data: {
            student
        }
    })
})