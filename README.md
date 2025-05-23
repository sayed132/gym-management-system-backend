# Gym Management System

A comprehensive gym management system built with TypeScript, Express.js, and MongoDB that handles class scheduling, trainer assignments, and member bookings.

## Project Overview

This system provides a robust platform for managing gym classes, trainers, and members. It includes features for scheduling classes, assigning trainers, booking classes, and managing user profiles. The system implements role-based access control with three user roles: admin, trainer, and trainee.

## Technology Stack

- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Logging**: morgan
- **CORS**: cors
- **Environment Variables**: dotenv

## Database Schema

### User Model

```typescript
{
  name: String,          // Required, 2-50 characters
  email: String,         // Required, unique, valid email format
  password: String,      // Required, min 6 characters
  role: String,          // Enum: "admin", "trainer", "trainee"
  phoneNumber: String,   // Optional, valid phone format
  address: String,       // Optional, max 200 characters
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

### Class Schedule Model

```typescript
{
  title: String,         // Required, 3-100 characters
  description: String,   // Required, 10-500 characters
  date: Date,           // Required, future date
  startTime: String,    // Required, HH:MM AM/PM format
  endTime: String,      // Required, HH:MM AM/PM format
  trainer: ObjectId,    // Required, reference to User
  trainees: [ObjectId], // Array of User references
  maxTrainees: Number,  // Default: 10, min: 1, max: 10
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-generated
}
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Class Schedule Routes

- `GET /api/schedules` - Get all class schedules
- `GET /api/schedules/by-date` - Get schedules grouped by date
- `GET /api/schedules/my-bookings` - Get user's booked classes (Trainee only)
- `POST /api/schedules` - Create new class schedule (Admin only)
- `PUT /api/schedules/:id` - Update class schedule (Admin only)
- `DELETE /api/schedules/:id` - Delete class schedule (Admin only)
- `PUT /api/schedules/:id/assign-trainer` - Assign trainer to class (Admin only)
- `POST /api/schedules/:id/book` - Book a class (Trainee only)
- `DELETE /api/schedules/:id/cancel-booking` - Cancel class booking (Trainee only)

## Admin Credentials

For testing purposes, you can use the following admin credentials:

```
Email: rafsansayed132@gmail.com
Password: admin@1234
```

## Instructions to Run Locally

1. Clone the repository:

```bash
git clone git@github.com:sayed132/gym-management-system-backend.git
cd gym-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Build the TypeScript code:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

For development with hot-reload:

```bash
npm run dev
```

## Testing Instructions

1. **Admin Features**:

   - Login with admin credentials
   - Create new class schedules
   - Assign trainers to classes
   - Update or delete existing schedules

2. **Trainer Features**:

   - Register as a trainer
   - View assigned classes
   - Update profile information

3. **Trainee Features**:
   - Register as a trainee
   - Browse available classes
   - Book classes
   - View booked classes
   - Cancel bookings

## Live Hosting Link

[[Live Link](https://gym-management-system-backend-ssry.onrender.com/)]

## Database Relationship Diagram

```mermaid
erDiagram
    User ||--o{ ClassSchedule : "trains"
    User ||--o{ ClassSchedule : "attends"
    ClassSchedule {
        ObjectId _id
        String title
        String description
        Date date
        String startTime
        String endTime
        ObjectId trainer
        Array trainees
        Number maxTrainees
    }
    User {
        ObjectId _id
        String name
        String email
        String password
        String role
        String phoneNumber
        String address
    }
```

## Error Handling

The system implements comprehensive error handling for:

- Validation errors
- Authentication errors
- Authorization errors
- Booking limit exceeded
- Schedule limit exceeded
- Database errors

## Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Environment variable configuration
