const express = require('express');
const { Student } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/students — list all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 }).lean();
    res.json(students.map(s => ({
      id: s._id,
      name: s.name,
      roll_no: s.roll_no,
      room_no: s.room_no || null,
      email: s.email || '',
      phone: s.phone || '',
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students — add a student
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, roll_no, room_no, email, phone } = req.body;
    if (!name || !roll_no) {
      return res.status(400).json({ error: 'Name and roll_no are required' });
    }

    const existing = await Student.findOne({ roll_no });
    if (existing) {
      return res.status(409).json({ error: 'A student with this roll number already exists' });
    }

    const student = await Student.create({
      name, roll_no,
      room_no: room_no || null,
      email: email || '',
      phone: phone || '',
    });

    res.status(201).json({ id: student._id, message: 'Student added successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate roll number' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/:id — update student
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, roll_no, room_no, email, phone } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, roll_no, room_no: room_no || null, email: email || '', phone: phone || '' },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate roll number' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id — delete student
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
