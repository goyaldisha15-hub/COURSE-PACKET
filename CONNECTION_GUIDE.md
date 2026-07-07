# Backend & Frontend Connection Guide

This document explains how the backend, frontend, and database are now connected.

## Architecture Overview

```
Frontend (React) 
    ↓ (Axios HTTP calls)
Backend (Express.js)
    ↓ (Database queries)
Database (SQLite)
```

## Setup Instructions

### 1. Database Setup

- **Type**: SQLite
- **Location**: `database/lms.db`
- **Auto-initialization**: The database is automatically created and initialized when the backend starts
- **Tables**: Users, Courses, Packets, Requests, Tracking Logs

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

- **Port**: 5000 (configurable via `PORT` env var)
- **API Base URL**: `http://localhost:5000/api`
- **Endpoints**:
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
  - `GET /api/packets/pending` - Get pending packets (admin)
  - `GET /api/packets/faculty` - Get faculty packets
  - `GET /api/packets/approved` - Get approved packets
  - `POST /api/packets/submit` - Submit packet
  - `POST /api/packets/:id/approve` - Approve packet
  - `POST /api/packets/:id/reject` - Reject packet
  - `GET /api/courses/student` - Get student courses
  - `GET /api/courses/student/:id` - Get course detail
  - And more...

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- **Development Server**: `http://localhost:5173` (Vite default)
- **API Configuration**: Set via `VITE_API_URL` in `.env`
- **Default API URL**: `http://localhost:5000/api`

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_PATH=./database/lms.db
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Communication Flow

### Authentication
1. User enters credentials in frontend login form
2. Frontend calls `POST /api/auth/login` with email, password, role
3. Backend validates against database and returns user data
4. Frontend stores user info in context/localStorage

### Data Fetching
1. Frontend calls appropriate endpoint (e.g., `GET /api/packets/approved`)
2. Backend queries SQLite database
3. Backend returns JSON response
4. Frontend updates state and re-renders

### Data Submission
1. User fills form in frontend
2. Frontend calls appropriate endpoint (e.g., `POST /api/packets/submit`)
3. Backend validates data and inserts into database
4. Backend returns created record
5. Frontend updates UI with new data

## Database Schema

### Users Table
- id (INTEGER PRIMARY KEY)
- name (TEXT)
- email (TEXT UNIQUE)
- password (TEXT)
- role (TEXT: admin, faculty, student)
- section (TEXT)
- accessSections (TEXT - JSON array)
- createdAt, updatedAt (TIMESTAMP)

### Packets Table
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- course (TEXT)
- description (TEXT)
- facultyEmail (TEXT)
- submittedBy (TEXT)
- status (TEXT: pending, approved, rejected)
- remarks (TEXT)
- createdAt, updatedAt (TIMESTAMP)

### Courses Table
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- code (TEXT UNIQUE)
- section (TEXT)
- facultyId (INTEGER FK)
- createdAt, updatedAt (TIMESTAMP)

### Requests Table
- id (INTEGER PRIMARY KEY)
- studentEmail (TEXT)
- courseId (INTEGER FK)
- status (TEXT)
- requestedAt, approvedAt (TIMESTAMP)

### Tracking Logs Table
- id (INTEGER PRIMARY KEY)
- packetId (INTEGER FK)
- studentEmail (TEXT)
- action (TEXT)
- viewedAt (TIMESTAMP)

## Testing the Connection

### 1. Start Backend
```bash
cd backend
npm start
```
You should see: "Connected to SQLite database" and "Backend server listening on http://localhost:5000"

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
You should see: "Local: http://localhost:5173"

### 3. Test Login
1. Navigate to `http://localhost:5173`
2. Try logging in with credentials:
   - Email: `admin@lms.com`, Password: `admin123`, Role: `admin`
   - Email: `priya@lms.com`, Password: `faculty123`, Role: `faculty`
   - Email: `aman@lms.com`, Password: `student123`, Role: `student`

Note: First time users won't exist in database. You can register a new account through the registration form.

## Troubleshooting

### Issue: "Connection refused" error
- Ensure backend is running on port 5000
- Check if firewall is blocking port 5000
- Verify API URL is correct in frontend `.env`

### Issue: "Database locked"
- Ensure only one backend instance is running
- Delete `database/lms.db` and restart to reinitialize

### Issue: CORS errors
- Backend has CORS enabled by default
- If issues persist, check that requests are coming from correct frontend URL

### Issue: SQLite errors
- Ensure `database/` directory exists
- Check file permissions for database directory
- Try deleting `database/lms.db` to reinitialize

## Production Considerations

- Replace SQLite with PostgreSQL or MySQL for production
- Implement proper authentication (JWT tokens)
- Add input validation and sanitization
- Use environment-specific configurations
- Implement error logging and monitoring
- Add database migrations system
- Implement connection pooling
