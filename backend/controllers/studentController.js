const Student = require('../models/Student');

// Register a new student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, department } = req.body;
        console.log("Register student request:", req.body);
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }
        const newStudent = new Student({ name, email, department });
        await newStudent.save();
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Error registering student:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all students
exports.getStudents = async (req, res) => {
    try {
        console.log("Get students request");
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Delete student request for ID:", id);
        await Student.findByIdAndDelete(id);
        res.status(200).json({ message: "Student deleted" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: error.message });
    }
};
