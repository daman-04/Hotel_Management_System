const express = require('express');
const { Pass, Student } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/passes — list all passes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const passes = await Pass.find()
      .sort({ issue_date: -1 })
      .populate('student_id', 'name roll_no')
      .lean();

    res.json(passes.map(p => ({
      id: p._id,
      student_name: p.student_id?.name || 'Unknown',
      roll_no: p.student_id?.roll_no || '',
      pass_type: p.pass_type,
      issue_date: p.issue_date,
      return_date: p.return_date,
      status: p.status,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/passes — issue a new pass
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { student_id, pass_type, return_date } = req.body;
    if (!student_id || !pass_type) {
      return res.status(400).json({ error: 'student_id and pass_type are required' });
    }

    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check for existing active pass
    const activePass = await Pass.findOne({ student_id, status: 'Active' });
    if (activePass) {
      return res.status(400).json({ error: `${student.name} already has an active ${activePass.pass_type} pass` });
    }

    await Pass.create({
      student_id,
      pass_type,
      issue_date: new Date().toISOString().split('T')[0],
      return_date: return_date || null,
      status: 'Active',
    });

    res.json({ message: `${pass_type} pass issued to ${student.name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/passes/:id — update pass status
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    const pass = await Pass.findByIdAndUpdate(
      req.params.id,
      {
        status,
        return_date: status === 'Returned' ? new Date().toISOString().split('T')[0] : undefined,
      },
      { new: true }
    );

    if (!pass) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    res.json({ message: 'Pass updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/passes/clear — clear all pass logs
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Pass.deleteMany({});
    res.json({ message: 'All pass logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
