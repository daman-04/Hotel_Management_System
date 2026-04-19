const express = require('express');
const { Fee, Student } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/fees — list all fee records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const fees = await Fee.find()
      .sort({ year: -1, month: -1 })
      .populate('student_id', 'name roll_no')
      .lean();

    res.json(fees.map(f => ({
      id: f._id,
      student_id: f.student_id ? f.student_id._id : null,
      student_name: f.student_id?.name || 'Unknown',
      roll_no: f.student_id?.roll_no || '',
      amount: f.amount,
      month: f.month,
      year: f.year,
      paid_date: f.paid_date,
      status: f.status,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fees/pay — record a payment
router.post('/pay', authenticateToken, async (req, res) => {
  try {
    const { student_id, amount, month, year } = req.body;
    if (!student_id || !amount || !month || !year) {
      return res.status(400).json({ error: 'student_id, amount, month, and year are required' });
    }

    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check for existing pending fee and mark it paid, or create new record
    const existingFee = await Fee.findOne({ student_id, month, year, status: 'pending' });

    if (existingFee) {
      existingFee.amount = amount;
      existingFee.paid_date = new Date().toISOString().split('T')[0];
      existingFee.status = 'paid';
      await existingFee.save();
    } else {
      await Fee.create({
        student_id,
        amount,
        month,
        year,
        paid_date: new Date().toISOString().split('T')[0],
        status: 'paid',
      });
    }

    res.json({ message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/fees/clear — clear all fee logs
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Fee.deleteMany({});
    res.json({ message: 'All fee logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
