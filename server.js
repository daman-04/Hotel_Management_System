const express = require('express');
const path = require('path');
const { connectDB } = require('./db/init');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure DB is connected before handling any requests (Serverless cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Connection Error:', err);
    res.status(500).send('Database connection failed.');
  }
});

// ── API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/passes', require('./routes/passes'));

// ── Catch-all for SPA ────────────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  // Local development start
  async function start() {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`\n🏨 Hostel Management System running at http://localhost:${PORT}\n`);
      });
    } catch (err) {
      console.error('❌ Failed to start:', err.message);
      process.exit(1);
    }
  }
  start();
}

// Export for Vercel Serverless Functions
module.exports = app;
