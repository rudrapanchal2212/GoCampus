const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Route to register a new student
router.post('/', studentController.registerStudent);

// Route to get all students
router.get('/', studentController.getStudents);

// Route to delete a student by ID
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
