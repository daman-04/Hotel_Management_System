const express = require('express');
const { Attendance, Student } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/attendance — list attendance records (optional ?date= filter)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const filterDate = req.query.date || new Date().toISOString().split('T')[0];

    // Get all students
    const students = await Student.find().sort({ name: 1 }).lean();
    
    // Get attendance for this date
    const records = await Attendance.find({ date: filterDate })
      .lean();
      
    // Map records by student_id
    const recordMap = {};
    for (const r of records) {
      recordMap[r.student_id.toString()] = r;
    }

    // Merge students with attendance status
    const dailyStatus = students.map(s => {
      const record = recordMap[s._id.toString()];
      return {
        id: record?._id || null,
        student_id: s._id,
        student_name: s.name,
        roll_no: s.roll_no,
        date: filterDate,
        time: record?.time || '—',
        status: record?.status || 'Pending',
      };
    });

    res.json(dailyStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance — mark attendance
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, status } = req.body;
    if (!student_id || !status) {
      return res.status(400).json({ error: 'student_id and status are required' });
    }

    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].slice(0, 5);

    const existing = await Attendance.findOne({ student_id, date });
    if (existing) {
      existing.status = status;
      existing.time = time;
      await existing.save();
      return res.json({ message: `Attendance updated for ${student.name}` });
    }

    await Attendance.create({ student_id, date, time, status });

    res.json({ message: `Attendance marked: ${student.name} — ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/mark-all — Mark all unmarked students present for a date
router.post('/mark-all', authenticateToken, async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const students = await Student.find().lean();
    const existing = await Attendance.find({ date: targetDate }).lean();
    const existingIds = new Set(existing.map(e => e.student_id.toString()));

    const toCreate = students
      .filter(s => !existingIds.has(s._id.toString()))
      .map(s => ({
        student_id: s._id,
        date: targetDate,
        time,
        status: 'Present'
      }));

    if (toCreate.length > 0) {
      await Attendance.insertMany(toCreate);
    }

    res.json({ message: `Marked ${toCreate.length} students as Present` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/attendance/clear — clear all attendance logs
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Attendance.deleteMany({});
    res.json({ message: 'All attendance logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
