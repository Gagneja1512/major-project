const express = require('express')
const teacherController = require('./../controllers/teacherController')
const teacherAuthController = require('./../controllers/teacherAuthController')

const router = express.Router()


router.route('/signin')
    .post(teacherAuthController.signup)

router.route('/login')
    .post(teacherAuthController.login)    

router.route('/')
    .get(teacherController.getAllStudents)

router.route('/:id')
    .get(teacherController.getStudent)

router.route('/:id/verifyStudent')
    .patch(teacherController.updateStudentVerify)


module.exports = router 