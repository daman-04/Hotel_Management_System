/* ══════════════════════════════════════════════════════════════════════════
   HOSTEL MANAGEMENT SYSTEM — Frontend Application (Premium)
   ══════════════════════════════════════════════════════════════════════════ */

// ── Auth Guard ────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!token) window.location.href = '/';

// ── API Helper ────────────────────────────────────────────────────────────
const API = {
  async request(method, url, body = null) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get(url) { return this.request('GET', url); },
  post(url, body) { return this.request('POST', url, body); },
  put(url, body) { return this.request('PUT', url, body); },
  delete(url) { return this.request('DELETE', url); },
};

// ── SVG Icon helpers ──────────────────────────────────────────────────────
const SVG = {
  check: `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  info: `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  undo: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
};

// ── Toast Notifications ───────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const icons = { success: SVG.check, error: SVG.x, info: SVG.info };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Modal ─────────────────────────────────────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');

function openModal(title, bodyHTML, footerHTML = '') {
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modalFooter.innerHTML = footerHTML;
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ── Navigation ────────────────────────────────────────────────────────────
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section-panel');
const pageTitle = document.getElementById('pageTitle');

const sectionTitles = {
  overview: 'Overview',
  students: 'Students',
  rooms: 'Rooms',
  fees: 'Fees & Payments',
  attendance: 'Attendance',
  passes: 'Passes',
};

const sectionLoaders = {
  overview: loadDashboard,
  students: loadStudents,
  rooms: loadRooms,
  fees: loadFees,
  attendance: loadAttendance,
  passes: loadPasses,
};

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    navBtns.forEach((n) => n.classList.remove('active'));
    btn.classList.add('active');
    sections.forEach((s) => s.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
    pageTitle.textContent = sectionTitles[section] || section;
    if (sectionLoaders[section]) sectionLoaders[section]();
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobile menu
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── User Info ─────────────────────────────────────────────────────────────
document.getElementById('userName').textContent = user.username || 'Admin';
document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Student';
document.getElementById('userAvatar').textContent = (user.username || 'A')[0].toUpperCase();

// ── Logout ────────────────────────────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

// ── Month Names ───────────────────────────────────────────────────────────
const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ══════════════════════════════════════════════════════════════════════════
//  DASHBOARD / OVERVIEW
// ══════════════════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const data = await API.get('/api/dashboard');

    animateCounter('statStudents', data.totalStudents);
    animateCounter('statRooms', data.totalRooms);
    animateCounter('statPending', data.pendingFees);
    animateCounter('statAttendance', data.todayAttendance);

    document.getElementById('statRoomsSub').textContent =
      `${data.occupiedRooms} occupied · ${data.availableRooms} available`;

    const tbody = document.getElementById('recentPaymentsBody');
    if (data.recentPayments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>No payments recorded yet</p></div></td></tr>`;
    } else {
      tbody.innerHTML = data.recentPayments.map((p) => `
        <tr>
          <td class="cell-primary">${p.student_name}</td>
          <td class="cell-mono">₹${p.amount.toLocaleString()}</td>
          <td>${MONTHS[p.month]} ${p.year}</td>
          <td class="cell-mono">${p.paid_date || '—'}</td>
          <td><span class="badge badge-success">Paid</span></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 700;
  const steps = 25;
  const increment = target / steps;
  let current = 0;
  let step = 0;
  const timer = setInterval(() => {
    step++;
    current = Math.round(increment * step);
    if (step >= steps) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current;
  }, duration / steps);
}

document.getElementById('clearLogsBtn')?.addEventListener('click', async () => {
  if (!confirm('Clear recent payment logs?')) return;
  try {
    const res = await API.delete('/api/dashboard/logs');
    showToast(res.message);
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('cleanUnknownBtn')?.addEventListener('click', async () => {
  if (!confirm('Remove all unknown/orphaned records?')) return;
  try {
    const res = await API.delete('/api/dashboard/clean-unknown');
    showToast(res.message);
    loadDashboard();
    if (allStudents.length > 0) loadFees(); // re-render if loaded
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  STUDENTS
// ══════════════════════════════════════════════════════════════════════════
let allStudents = [];

async function loadStudents() {
  try {
    allStudents = await API.get('/api/students');
    renderStudents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderStudents(filter = '') {
  const tbody = document.getElementById('studentsBody');
  const filtered = filter
    ? allStudents.filter(s =>
        s.name.toLowerCase().includes(filter) ||
        s.roll_no.toLowerCase().includes(filter) ||
        (s.email || '').toLowerCase().includes(filter) ||
        (s.room_no || '').toLowerCase().includes(filter)
      )
    : allStudents;
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>${filter ? 'No matching students' : 'No students found'}</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map((s, i) => `
    <tr>
      <td class="cell-mono">${i + 1}</td>
      <td class="cell-primary">${s.name}</td>
      <td class="cell-mono">${s.roll_no}</td>
      <td><span class="badge badge-info">${s.room_no || 'Unassigned'}</span></td>
      <td>${s.email || '—'}</td>
      <td class="cell-mono">${s.phone || '—'}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editStudent('${s.id}')" title="Edit">${SVG.edit}</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteStudent('${s.id}', '${s.name.replace(/'/g, "\\'")}')" title="Delete">${SVG.trash}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Student search
const studentSearchInput = document.getElementById('studentSearch');
if (studentSearchInput) {
  studentSearchInput.addEventListener('input', (e) => {
    renderStudents(e.target.value.toLowerCase().trim());
  });
}

function studentFormHTML(s = {}) {
  return `
    <form id="studentForm">
      <div class="form-field"><label>Name *</label><input type="text" id="sName" value="${s.name || ''}" placeholder="Full name" required /></div>
      <div class="form-field"><label>Roll No *</label><input type="text" id="sRoll" value="${s.roll_no || ''}" placeholder="e.g. 11060" required /></div>
      <div class="form-field"><label>Room No</label><input type="text" id="sRoom" value="${s.room_no || ''}" placeholder="e.g. 419" /></div>
      <div class="form-field"><label>Email</label><input type="email" id="sEmail" value="${s.email || ''}" placeholder="email@example.com" /></div>
      <div class="form-field"><label>Phone</label><input type="text" id="sPhone" value="${s.phone || ''}" placeholder="Phone number" /></div>
    </form>
  `;
}

document.getElementById('addStudentBtn').addEventListener('click', () => {
  openModal('Add Student', studentFormHTML(), `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitStudent()">Add Student</button>
  `);
});

async function submitStudent(editId = null) {
  const body = {
    name: document.getElementById('sName').value.trim(),
    roll_no: document.getElementById('sRoll').value.trim(),
    room_no: document.getElementById('sRoom').value.trim(),
    email: document.getElementById('sEmail').value.trim(),
    phone: document.getElementById('sPhone').value.trim(),
  };
  if (!body.name || !body.roll_no) return showToast('Name and Roll No are required', 'error');
  try {
    if (editId) {
      await API.put(`/api/students/${editId}`, body);
      showToast('Student updated successfully');
    } else {
      await API.post('/api/students', body);
      showToast('Student added successfully');
    }
    closeModal();
    loadStudents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.editStudent = function (id) {
  const s = allStudents.find((x) => x.id === id);
  if (!s) return;
  openModal('Edit Student', studentFormHTML(s), `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitStudent('${id}')">Save Changes</button>
  `);
};

window.deleteStudent = async function (id, name) {
  if (!confirm(`Delete student "${name}"? This cannot be undone.`)) return;
  try {
    await API.delete(`/api/students/${id}`);
    showToast('Student deleted');
    loadStudents();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  ROOMS
// ══════════════════════════════════════════════════════════════════════════
let allRooms = [];

async function loadRooms() {
  try {
    allRooms = await API.get('/api/rooms');
    renderRooms();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRooms() {
  const grid = document.getElementById('roomsGrid');
  if (allRooms.length === 0) {
    grid.innerHTML = `<div class="empty-state"><p>No rooms added yet</p></div>`;
    return;
  }
  grid.innerHTML = allRooms.map((r) => {
    const pct = r.capacity > 0 ? (r.occupied / r.capacity) * 100 : 0;
    const fillClass = pct >= 100 ? 'full' : pct > 0 ? 'partial' : 'empty';
    return `
      <div class="room-card">
        <div class="room-head" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="room-number">${r.room_no}</span>
            <span class="room-type-badge">${r.type}</span>
          </div>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteRoom('${r.id}')" title="Delete Room" style="color:var(--destructive); height:24px; width:24px; padding:0;">
            ${SVG.trash}
          </button>
        </div>
        <div class="room-floor">Floor ${r.floor}</div>
        <div class="occ-bar-wrap">
          <div class="occ-bar"><div class="occ-fill ${fillClass}" style="width:${Math.min(pct, 100)}%"></div></div>
          <span class="occ-label">${r.occupied}/${r.capacity}</span>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('addRoomBtn').addEventListener('click', () => {
  openModal('Add Room', `
    <form id="roomForm">
      <div class="form-field"><label>Room No *</label><input type="text" id="rNo" placeholder="e.g. 101" required /></div>
      <div class="form-field"><label>Type</label>
        <select id="rType">
          <option value="Single">Single</option>
          <option value="Double" selected>Double</option>
          <option value="AC">AC</option>
          <option value="Non-AC">Non-AC</option>
        </select>
      </div>
      <div class="form-field"><label>Capacity</label><input type="number" id="rCap" value="2" min="1" /></div>
      <div class="form-field"><label>Floor</label><input type="number" id="rFloor" value="1" min="1" /></div>
    </form>
  `, `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitRoom()">Add Room</button>
  `);
});

window.submitRoom = async function () {
  const body = {
    room_no: document.getElementById('rNo').value.trim(),
    type: document.getElementById('rType').value,
    capacity: parseInt(document.getElementById('rCap').value) || 2,
    floor: parseInt(document.getElementById('rFloor').value) || 1,
  };
  if (!body.room_no) return showToast('Room number is required', 'error');
  try {
    await API.post('/api/rooms', body);
    showToast('Room added successfully');
    closeModal();
    loadRooms();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('allocateRoomBtn').addEventListener('click', async () => {
  if (allStudents.length === 0) await loadStudents();
  if (allRooms.length === 0) await loadRooms();

  const studentOpts = allStudents.map((s) => `<option value="${s.id}">${s.name} (${s.roll_no})</option>`).join('');
  const roomOpts = allRooms.filter((r) => r.occupied < r.capacity).map((r) => `<option value="${r.room_no}">Room ${r.room_no} — ${r.occupied}/${r.capacity}</option>`).join('');

  openModal('Allocate Room', `
    <form>
      <div class="form-field"><label>Student *</label><select id="allocStudent">${studentOpts}</select></div>
      <div class="form-field"><label>Room *</label><select id="allocRoom">${roomOpts || '<option disabled>No rooms available</option>'}</select></div>
    </form>
  `, `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitAllocate()">Allocate</button>
  `);
});

window.submitAllocate = async function () {
  try {
    const body = {
      student_id: document.getElementById('allocStudent').value,
      room_no: document.getElementById('allocRoom').value,
    };
    const result = await API.post('/api/rooms/allocate', body);
    showToast(result.message);
    closeModal();
    loadRooms();
    loadStudents();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteRoom = async function (id) {
  if (!confirm('Are you sure you want to delete this room?')) return;
  try {
    await API.delete(`/api/rooms/${id}`);
    showToast('Room deleted successfully');
    loadRooms();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  FEES
// ══════════════════════════════════════════════════════════════════════════
async function loadFees() {
  try {
    const fees = await API.get('/api/fees');
    const tbody = document.getElementById('feesBody');
    if (fees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>No fee records</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = fees.map((f) => `
      <tr>
        <td class="cell-primary">${f.student_name}</td>
        <td class="cell-mono">${f.roll_no}</td>
        <td class="cell-mono">₹${f.amount.toLocaleString()}</td>
        <td>${MONTHS[f.month]} ${f.year}</td>
        <td class="cell-mono">${f.paid_date || '—'}</td>
        <td><span class="badge ${f.status === 'paid' ? 'badge-success' : 'badge-warning'}">${f.status}</span></td>
        <td>
          ${f.status === 'pending'
            ? `<button class="btn btn-ghost btn-sm" onclick="quickPayFee('${f.student_id}', ${f.amount}, ${f.month}, ${f.year})">${SVG.edit} Pay</button>`
            : '<span style="color:var(--muted-foreground)">—</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.quickPayFee = async function (student_id, amount, month, year) {
  try {
    await API.post('/api/fees/pay', { student_id, amount, month, year });
    showToast('Payment recorded');
    loadFees();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('clearFeesBtn')?.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to clear ALL fee logs?')) return;
  try {
    const res = await API.delete('/api/fees/clear');
    showToast(res.message);
    loadFees();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('recordPaymentBtn').addEventListener('click', async () => {
  if (allStudents.length === 0) await loadStudents();
  const studentOpts = allStudents.map((s) => `<option value="${s.id}">${s.name} (${s.roll_no})</option>`).join('');
  const now = new Date();

  openModal('Record Payment', `
    <form>
      <div class="form-field"><label>Student *</label><select id="fStudent">${studentOpts}</select></div>
      <div class="form-field"><label>Amount (₹) *</label><input type="number" id="fAmount" value="5000" min="1" /></div>
      <div class="form-field"><label>Month *</label>
        <select id="fMonth">
          ${MONTHS.slice(1).map((m, i) => `<option value="${i+1}" ${i+1 === now.getMonth()+1 ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="form-field"><label>Year *</label><input type="number" id="fYear" value="${now.getFullYear()}" /></div>
    </form>
  `, `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="submitPayment()">Record Payment</button>
  `);
});

window.submitPayment = async function () {
  try {
    const body = {
      student_id: document.getElementById('fStudent').value,
      amount: parseFloat(document.getElementById('fAmount').value),
      month: parseInt(document.getElementById('fMonth').value),
      year: parseInt(document.getElementById('fYear').value),
    };
    await API.post('/api/fees/pay', body);
    showToast('Payment recorded');
    closeModal();
    loadFees();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ══════════════════════════════════════════════════════════════════════════
//  ATTENDANCE
// ══════════════════════════════════════════════════════════════════════════
async function loadAttendance(dateFilter) {
  try {
    const url = dateFilter ? `/api/attendance?date=${dateFilter}` : '/api/attendance';
    const records = await API.get(url);
    const tbody = document.getElementById('attendanceBody');
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p>${dateFilter ? 'No records for this date' : 'No attendance records'}</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = records.map((a) => {
      const getBadge = (s) => s === 'Present' ? 'badge-success' : s === 'Late' ? 'badge-warning' : s === 'Absent' ? 'badge-danger' : 'badge-info';
      return `
        <tr>
          <td class="cell-primary">${a.student_name}</td>
          <td class="cell-mono">${a.roll_no}</td>
          <td class="cell-mono">${a.time}</td>
          <td><span class="badge ${getBadge(a.status)}">${a.status}</span></td>
          <td>
            <div class="flex gap-2">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="markDailyAttendance('${a.student_id}', 'Present')" title="Present">✅</button>
              <button class="btn btn-ghost btn-icon btn-sm" onclick="markDailyAttendance('${a.student_id}', 'Absent')" title="Absent">❌</button>
              <button class="btn btn-ghost btn-icon btn-sm" onclick="markDailyAttendance('${a.student_id}', 'Late')" title="Late">⏰</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Attendance date filter
const attendanceDateInput = document.getElementById('attendanceDate');
if (attendanceDateInput) {
  attendanceDateInput.value = new Date().toISOString().split('T')[0];
  attendanceDateInput.addEventListener('change', (e) => {
    loadAttendance(e.target.value || null);
  });
}

window.markDailyAttendance = async function (student_id, status) {
  try {
    await API.post('/api/attendance', { student_id, status });
    loadAttendance(document.getElementById('attendanceDate').value || null);
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('markAllPresentBtn')?.addEventListener('click', async () => {
  try {
    const targetDate = document.getElementById('attendanceDate').value || new Date().toISOString().split('T')[0];
    const res = await API.post('/api/attendance/mark-all', { date: targetDate });
    showToast(res.message);
    loadAttendance(targetDate);
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('clearAttendanceBtn')?.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to clear ALL attendance logs?')) return;
  try {
    const res = await API.delete('/api/attendance/clear');
    showToast(res.message);
    loadAttendance(document.getElementById('attendanceDate').value || null);
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  PASSES
// ══════════════════════════════════════════════════════════════════════════
async function loadPasses() {
  try {
    if (allStudents.length === 0) await loadStudents();
    const quickPassStudent = document.getElementById('quickPassStudent');
    if (quickPassStudent && quickPassStudent.options.length === 0) {
      quickPassStudent.innerHTML = allStudents.map((s) => `<option value="${s.id}">${s.name} (${s.roll_no})</option>`).join('');
    }

    const passes = await API.get('/api/passes');
    const tbody = document.getElementById('passesBody');
    if (passes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>No passes issued</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = passes.map((p) => `
      <tr>
        <td class="cell-primary">${p.student_name}</td>
        <td class="cell-mono">${p.roll_no}</td>
        <td>${p.pass_type}</td>
        <td class="cell-mono">${p.issue_date}</td>
        <td class="cell-mono">${p.return_date || '—'}</td>
        <td><span class="badge ${p.status === 'Active' ? 'badge-warning' : 'badge-success'}">${p.status}</span></td>
        <td>
          ${p.status === 'Active'
            ? `<button class="btn btn-ghost btn-sm" onclick="returnPass('${p.id}')">${SVG.undo} Return</button>`
            : '<span style="color:var(--muted-foreground)">—</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('quickIssuePassBtn')?.addEventListener('click', async () => {
  try {
    const student_id = document.getElementById('quickPassStudent').value;
    const pass_type = document.getElementById('quickPassType').value;
    if (!student_id) return showToast('Please select a student', 'error');

    await API.post('/api/passes', { student_id, pass_type, return_date: null });
    showToast('Pass issued successfully');
    loadPasses();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

window.returnPass = async function (id) {
  if (!confirm('Mark this pass as returned?')) return;
  try {
    await API.put(`/api/passes/${id}`, { status: 'Returned' });
    showToast('Pass marked as returned');
    loadPasses();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

document.getElementById('clearPassesBtn')?.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to clear ALL pass logs?')) return;
  try {
    const res = await API.delete('/api/passes/clear');
    showToast(res.message);
    loadPasses();
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ── Initial Load ──────────────────────────────────────────────────────────
loadDashboard();
