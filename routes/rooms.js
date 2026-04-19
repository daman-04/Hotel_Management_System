const express = require('express');
const { Room, Student } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms — list all rooms with occupancy data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ room_no: 1 }).lean();

    // Count students in each room
    const occupancyCounts = await Student.aggregate([
      { $match: { room_no: { $ne: null, $ne: '' } } },
      { $group: { _id: '$room_no', count: { $sum: 1 } } },
    ]);
    const occupancyMap = {};
    for (const item of occupancyCounts) {
      occupancyMap[item._id] = item.count;
    }

    res.json(rooms.map(r => ({
      id: r._id,
      room_no: r.room_no,
      type: r.type,
      capacity: r.capacity,
      floor: r.floor,
      occupied: occupancyMap[r.room_no] || 0,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rooms — add a room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { room_no, type, capacity, floor } = req.body;
    if (!room_no) {
      return res.status(400).json({ error: 'Room number is required' });
    }

    const existing = await Room.findOne({ room_no });
    if (existing) {
      return res.status(409).json({ error: 'Room already exists' });
    }

    const room = await Room.create({
      room_no,
      type: type || 'Double',
      capacity: capacity || 2,
      floor: floor || 1,
    });

    res.status(201).json({ id: room._id, message: 'Room added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rooms/allocate — assign student to room
router.post('/allocate', authenticateToken, async (req, res) => {
  try {
    const { student_id, room_no } = req.body;
    if (!student_id || !room_no) {
      return res.status(400).json({ error: 'Student ID and room number are required' });
    }

    const room = await Room.findOne({ room_no });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const currentOccupancy = await Student.countDocuments({ room_no: room.room_no });
    if (currentOccupancy >= room.capacity) {
      return res.status(400).json({ error: 'Room is at full capacity' });
    }

    const student = await Student.findByIdAndUpdate(student_id, { room_no }, { new: true });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: `${student.name} allocated to room ${room_no}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rooms/:id — remove a room
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Ensure it's empty
    const currentOccupancy = await Student.countDocuments({ room_no: room.room_no });
    if (currentOccupancy > 0) {
      return res.status(400).json({ error: 'Cannot delete an occupied room. Reassign students first.' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: `Room ${room.room_no} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
