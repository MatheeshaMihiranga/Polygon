# Employee Task Management Mobile Application

A full-stack mobile application for managing employee tasks, built with React Native (Expo), Node.js, Express.js, and MySQL.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Build Instructions](#build-instructions)
9. [API Endpoints](#api-endpoints)
10. [Default Credentials](#default-credentials)
11. [Features](#features)

---

## Project Overview

This application provides a role-based task management system for teams.

**Administrator can:**
- Create, view, update, and delete tasks
- Assign tasks to employees
- Monitor overall task progress and employee statistics
- View all employees and their task workload

**Employee can:**
- View their assigned tasks
- Update task status (Pending → In Progress → Completed)
- View detailed task information
- Manage their profile and change password

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|--------------------------------------------------------|
| Mobile    | React Native · Expo SDK 55 · TypeScript                |
| Routing   | Expo Router v4 (file-based)                            |
| Styling   | NativeWind v4 (Tailwind CSS for React Native)          |
| State     | Redux Toolkit · React Redux                            |
| Storage   | AsyncStorage (session persistence)                     |
| HTTP      | Axios                                                  |
| Backend   | Node.js · Express.js                                   |
| Database  | MySQL 8                                                |
| Auth      | JWT (jsonwebtoken) · bcryptjs                          |

---

## Project Structure

```
Polygon/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, profile
│   │   │   ├── taskController.js    # Task CRUD + stats
│   │   │   └── userController.js    # Employee list, profile update
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT verify, role guard
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── taskRoutes.js
│   │       └── userRoutes.js
│   ├── server.js
│   ├── schema.sql                   # Database schema
│   ├── seed.js                      # Seed demo data
│   ├── .env.example
│   └── package.json
│
└── mobile/
    ├── app/
    │   ├── _layout.tsx              # Root layout (Redux Provider)
    │   ├── index.tsx                # Session restore & redirect
    │   ├── login.tsx                # Login screen
    │   ├── (admin)/
    │   │   ├── _layout.tsx          # Admin tab navigator
    │   │   ├── index.tsx            # Admin dashboard
    │   │   ├── tasks.tsx            # Task list with search/filter
    │   │   ├── create-task.tsx      # Create task form
    │   │   ├── edit-task.tsx        # Edit/delete task form
    │   │   └── employees.tsx        # Employee list + stats
    │   └── (employee)/
    │       ├── _layout.tsx          # Employee tab navigator
    │       ├── index.tsx            # Employee dashboard
    │       ├── tasks.tsx            # My tasks with search/filter
    │       ├── task-detail.tsx      # Task details + status update
    │       └── profile.tsx          # Profile management
    ├── components/
    │   ├── TaskCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── PriorityBadge.tsx
    │   ├── LoadingSpinner.tsx
    │   └── EmptyState.tsx
    ├── store/
    │   ├── index.ts                 # Redux store
    │   └── slices/
    │       ├── authSlice.ts
    │       ├── taskSlice.ts
    │       └── userSlice.ts
    ├── services/
    │   └── api.ts                   # Axios instance + API helpers
    ├── types/
    │   └── index.ts                 # TypeScript interfaces
    ├── global.css                   # Tailwind entry
    ├── tailwind.config.js
    ├── metro.config.js
    ├── babel.config.js
    ├── app.json
    └── package.json
```

---

## Installation

### Prerequisites

- **Node.js** >= 18.x — [nodejs.org](https://nodejs.org)
- **MySQL** >= 8.0 — [mysql.com](https://dev.mysql.com/downloads/)
- **Expo CLI** — `npm install -g expo-cli`
- **EAS CLI** (for APK builds) — `npm install -g eas-cli`
- **Android Studio** or **Expo Go** app on a physical device

---

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Polygon
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Mobile

```bash
cd mobile
npm install
```

---

## Environment Configuration

### Backend (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_task_db
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d
```

### Mobile API URL (`mobile/services/api.ts`)

Update `BASE_URL` to match your environment:

| Environment         | URL                              |
|---------------------|----------------------------------|
| Android Emulator    | `http://10.0.2.2:5000/api`       |
| Physical Device     | `http://<YOUR_LOCAL_IP>:5000/api` |
| iOS Simulator       | `http://localhost:5000/api`       |

---

## Database Setup

### 1. Create the schema

```bash
mysql -u root -p < backend/schema.sql
```

### 2. Seed demo data

```bash
cd backend
npm run seed
```

This creates the following demo users and sample tasks:

| Role     | Email                | Password     |
|----------|----------------------|--------------|
| Admin    | admin@company.com    | admin123     |
| Employee | john@company.com     | password123  |
| Employee | jane@company.com     | password123  |
| Employee | bob@company.com      | password123  |

---

## Running the Application

### Start the backend

```bash
cd backend
npm run dev        # Development (with nodemon)
# or
npm start          # Production
```

The API will be available at `http://localhost:5000`.

### Start the mobile app

```bash
cd mobile
npx expo start
```

Then press:
- **`a`** to open in Android emulator
- **`i`** to open in iOS simulator
- Scan the QR code with **Expo Go** for a physical device

---

## Build Instructions

### Android APK (via EAS)

```bash
cd mobile
eas login                                          # Log in to Expo account
eas build:configure                                # First-time setup
eas build --platform android --profile preview     # Build APK
```

### Android APK (local build)

```bash
cd mobile
npx expo run:android --variant release
```

The APK will be generated in `mobile/android/app/build/outputs/apk/`.

---

## API Endpoints

### Authentication

| Method | Endpoint          | Description          | Auth |
|--------|-------------------|----------------------|------|
| POST   | /api/auth/login   | Login (any role)     | No   |
| GET    | /api/auth/profile | Get current user     | Yes  |

### Tasks

| Method | Endpoint          | Description                      | Role           |
|--------|-------------------|----------------------------------|----------------|
| GET    | /api/tasks        | List tasks (filtered by role)    | All            |
| GET    | /api/tasks/stats  | Task count statistics            | All            |
| GET    | /api/tasks/:id    | Get single task                  | All            |
| POST   | /api/tasks        | Create task                      | Admin          |
| PUT    | /api/tasks/:id    | Update task (admin: full; employee: status only) | All |
| DELETE | /api/tasks/:id    | Delete task                      | Admin          |

**Query params for GET /api/tasks:** `?status=pending&priority=high&search=keyword`

### Users

| Method | Endpoint              | Description               | Role   |
|--------|-----------------------|---------------------------|--------|
| GET    | /api/users/employees  | All employees + task stats | Admin  |
| GET    | /api/users/:id        | Get user profile           | Self / Admin |
| PUT    | /api/users/:id        | Update profile / password  | Self   |

---

## Features

### Core
- [x] Single login screen for all roles
- [x] JWT authentication with AsyncStorage session persistence
- [x] Automatic role-based redirection after login
- [x] Redux Toolkit state management
- [x] Task CRUD (Create, Read, Update, Delete)
- [x] Task assignment to employees
- [x] Task status management (Pending / In Progress / Completed)
- [x] Employee profile management with password change
- [x] Admin employee overview with task progress stats

### Bonus
- [x] Task search (title + description)
- [x] Task filtering by status
- [x] Pull-to-refresh on all list screens
- [x] Responsive mobile UI with NativeWind

---

## Git Commit History

Development follows meaningful commits demonstrating progress:

1. `init: project scaffold for backend and mobile`
2. `feat(backend): add auth, task, and user REST API`
3. `feat(mobile): add Redux store, auth slice, and login screen`
4. `feat(mobile): implement admin dashboard and task CRUD screens`
5. `feat(mobile): implement employee screens and profile management`
6. `feat: add task search, filtering, and pull-to-refresh`
7. `docs: add README with setup and API documentation`
