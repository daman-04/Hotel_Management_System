const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── In-memory MongoDB for zero-config setup ──────────────────────────────
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB (in-memory)');

  // Seed data after connection
  await seedData();
}

// ── Schemas ──────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll_no: { type: String, unique: true, required: true },
  room_no: { type: String, default: null },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
}, { timestamps: true });

const roomSchema = new mongoose.Schema({
  room_no: { type: String, unique: true, required: true },
  type: { type: String, enum: ['Single', 'Double', 'AC', 'Non-AC'], default: 'Double' },
  capacity: { type: Number, default: 2, min: 1 },
  floor: { type: Number, default: 1, min: 1 },
});

const feeSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  paid_date: { type: String, default: null },
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
});

const passSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  pass_type: { type: String, required: true },
  issue_date: { type: String, required: true },
  return_date: { type: String, default: null },
  status: { type: String, enum: ['Active', 'Returned', 'Expired'], default: 'Active' },
});

// ── Models ───────────────────────────────────────────────────────────────

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Room = mongoose.model('Room', roomSchema);
const Fee = mongoose.model('Fee', feeSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Pass = mongoose.model('Pass', passSchema);

// ── Seed Data ────────────────────────────────────────────────────────────

async function seedData() {
  // Admin user
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    await User.create({ username: 'admin', password_hash: hash, role: 'admin' });
    console.log('  → Default admin created (admin / admin123)');
  }

  // Demo students
  const studentCount = await Student.countDocuments();
  if (studentCount === 0) {
    const students = await Student.insertMany([
      { name: 'Ayushman', roll_no: '11060', room_no: '419', email: 'ayushman@hostel.com', phone: '9876543210' },
      { name: 'Sagar', roll_no: '11061', room_no: '416', email: 'sagar@hostel.com', phone: '9876543211' },
      { name: 'Devansh Bansal', roll_no: '11062', room_no: '410', email: 'devansh@hostel.com', phone: '9876543212' },
      { name: 'Neeta', roll_no: '11063', room_no: '421', email: 'neeta@hostel.com', phone: '9876543213' },
      { name: 'Daman', roll_no: '11064', room_no: '421', email: 'daman@hostel.com', phone: '9876543214' },
    ]);
    console.log('  → 5 demo students created');

    // Demo fees
    const feeRecords = [];
    for (const s of students) {
      feeRecords.push(
        { student_id: s._id, amount: 5000, month: 1, year: 2025, paid_date: '2025-01-15', status: 'paid' },
        { student_id: s._id, amount: 5000, month: 2, year: 2025, paid_date: '2025-02-12', status: 'paid' },
        { student_id: s._id, amount: 5000, month: 3, year: 2025, paid_date: '2025-03-10', status: 'paid' },
        { student_id: s._id, amount: 5000, month: 4, year: 2025, paid_date: null, status: 'pending' },
      );
    }
    await Fee.insertMany(feeRecords);
    console.log('  → Demo fee records seeded');
  }

  // Demo rooms
  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    await Room.insertMany([
      { room_no: '101', type: 'Single', capacity: 1, floor: 1 },
      { room_no: '102', type: 'Single', capacity: 1, floor: 1 },
      { room_no: '103', type: 'Double', capacity: 2, floor: 1 },
      { room_no: '201', type: 'AC', capacity: 2, floor: 2 },
      { room_no: '202', type: 'AC', capacity: 2, floor: 2 },
      { room_no: '203', type: 'Non-AC', capacity: 3, floor: 2 },
      { room_no: '301', type: 'Double', capacity: 2, floor: 3 },
      { room_no: '302', type: 'Single', capacity: 1, floor: 3 },
      { room_no: '303', type: 'AC', capacity: 2, floor: 3 },
      { room_no: '410', type: 'Double', capacity: 2, floor: 4 },
      { room_no: '416', type: 'Double', capacity: 2, floor: 4 },
      { room_no: '419', type: 'Double', capacity: 2, floor: 4 },
      { room_no: '421', type: 'Double', capacity: 2, floor: 4 },
      { room_no: '502', type: 'AC', capacity: 20, floor: 5 },
    ]);
    console.log('  → 14 demo rooms seeded');
  }

  console.log('✅ Database seeded successfully');
}

module.exports = { connectDB, User, Student, Room, Fee, Attendance, Pass };
