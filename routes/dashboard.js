const express = require('express');
const { Student, Fee, Room, Attendance, Pass } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard — aggregate stats for admin dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRooms = await Room.countDocuments();

    // Occupied rooms: distinct room_no from students
    const occupiedRoomNos = await Student.distinct('room_no', { room_no: { $ne: null, $ne: '' } });
    const occupiedRooms = occupiedRoomNos.filter(Boolean).length;

    const pendingFees = await Fee.countDocuments({ status: 'pending' });

    const totalRevenueResult = await Fee.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.countDocuments({ date: todayDate });

    const activePasses = await Pass.countDocuments({ status: 'Active' });

    // Recent payments (last 5)
    const recentFees = await Fee.find({ status: 'paid' })
      .sort({ paid_date: -1 })
      .limit(5)
      .populate('student_id', 'name roll_no')
      .lean();

    const recentPayments = recentFees.map(f => ({
      ...f,
      id: f._id,
      student_name: f.student_id?.name || 'Unknown',
      roll_no: f.student_id?.roll_no || '',
    }));

    res.json({
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      pendingFees,
      totalRevenue,
      todayAttendance,
      activePasses,
      recentPayments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/dashboard/logs — Clear system historical logs (attendance and passes)
router.delete('/logs', authenticateToken, async (req, res) => {
  try {
    await Fee.deleteMany({});
    res.json({ message: 'Dashboard logs (Recent payments) cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/dashboard/clean-unknown — Remove orphan records (unknown shit)
router.delete('/clean-unknown', authenticateToken, async (req, res) => {
  try {
    const activeStudentIds = await Student.find({}, '_id').lean();
    const activeIds = activeStudentIds.map(s => s._id);

    const fRes = await Fee.deleteMany({ student_id: { $nin: activeIds } });
    const pRes = await Pass.deleteMany({ student_id: { $nin: activeIds } });
    const aRes = await Attendance.deleteMany({ student_id: { $nin: activeIds } });

    res.json({ 
      message: `Cleaned unknown data: ${fRes.deletedCount} fees, ${pRes.deletedCount} passes, ${aRes.deletedCount} attendance.` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
