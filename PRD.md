# Product Requirements Document (PRD): Hostel Management System

## 1. Overview
The Hostel Management System is a web-based application designed to streamline the day-to-day administration of a hostel. It enables hostel administrators to manage student/resident records, room allocations, and fee payments efficiently. The system consists of a dynamic frontend and a robust backend REST API.

## 2. Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla for styling), JavaScript (Vanilla for logic and API integration)
- **Backend**: Node.js with Express.js framework
- **Database**: SQLite (utilizing the existing `hostel_management.db`)
- **API Architecture**: RESTful API design

## 3. Core Features & Requirements

### 3.1. Authentication & Authorization
- **Login Module**: Secure authentication for Admin and Resident roles.
- **Session Security**: Use JSON Web Tokens (JWT) or session cookies for protecting API endpoints.

### 3.2. Resident Management
- **CRUD Operations**: Add, read, update, and delete resident profiles.
- **Data Points**: Name, email, phone, permanent address, emergency contact, date of joining.

### 3.3. Room Management
- **Room Tracking**: Monitor total rooms, available beds, and occupied status.
- **Allocation Engine**: Interface to allocate or re-assign rooms to residents.
- **Room Categories**: Support for different types (e.g., Single, Double, AC, Non-AC).

### 3.4. Fee & Payment Tracking
- **Payment History**: Record monthly rent/fee payments per resident.
- **Outstanding Dues**: Auto-calculate and display pending amounts.

### 3.5. Interactive Dashboards
- **Admin Dashboard**: Bird's-eye view displaying metrics like total capacity, current occupancy, and recent fee payments.
- **Resident Dashboard**: Personalized view for residents to check their room details and payment history.

## 4. System Architecture

### 4.1. Frontend Structure
The frontend will follow a modern, glassmorphic, and dynamic design aesthetic.
- `/public/index.html` - Login and Entry point.
- `/public/admin.html` - Admin dashboard.
- `/public/css/style.css` - Global styles, variables, typography, and responsive grid.
- `/public/js/app.js` - API consumption using `fetch()`, DOM manipulation, and state management.

### 4.2. Backend REST API Endpoints

#### Auth
- `POST /api/auth/login` - Authenticate users.

#### Residents
- `GET /api/residents` - Fetch list of all residents.
- `GET /api/residents/:id` - Fetch single resident details.
- `POST /api/residents` - Register a new resident.
- `PUT /api/residents/:id` - Update resident details.
- `DELETE /api/residents/:id` - Remove a resident.

#### Rooms
- `GET /api/rooms` - Fetch room list and availability.
- `POST /api/rooms/allocate` - Assign a room to a resident.

#### Fees
- `GET /api/fees` - View payment records.
- `POST /api/fees/pay` - Record a new fee payment.

## 5. Design & User Experience (UX) Strategy
- **Rich Aesthetics**: A cohesive color palette, modern typography (e.g., Inter), and clean UI.
- **Responsiveness**: Fully responsive layout adapting to mobile, tablet, and desktop viewports.
- **Interactivity**: Hover effects, smooth transitions, and toast notifications for API responses (success/error).

## 6. Development Phasing

1. **Phase 1: Project Setup & Database Configuration**
   - Initialize `package.json` and install dependencies (`express`, `sqlite3`, `cors`).
   - Create tables in `hostel_management.db` (Users, Residents, Rooms, Payments).
2. **Phase 2: API Development**
   - Build and test REST API endpoints using Postman or cURL.
3. **Phase 3: Frontend Implementation**
   - Create HTML skeletons and style them using Vanilla CSS.
   - Write Javascript to connect static HTML to live backend data.
4. **Phase 4: Integration & Polish**
   - Combine frontend and backend (serve static files via Express).
   - Test edge cases, handle errors, and optimize performance.
