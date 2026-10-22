# Issue Tracker

A full-stack, responsive issue management application built with React, Vite, Tailwind CSS, Express, MongoDB, and JWT authentication.

---

## Live Links

- **Frontend Deployment (Vercel)**: https://issue-tracker-lovat-pi.vercel.app
- **Backend API (Render)**: https://issue-tracker-g2fy.onrender.com
- **GitHub Repository**: https://github.com/Deveshpoojary/issue-tracker

---

## Project Overview

Issue Tracker is designed for teams to create, track, prioritize, and collaborate on project issues. It features a minimal black-and-white interface, real-time status counters, task assignment, and comment discussions. Tasks are visible strictly to the creator and the assigned user. An admin panel is also included for administrators to view system stats, manage registered users, and oversee all issues.

---

## Features

- **Authentication & Security**: Secure user signup and login using JWT tokens and bcrypt password hashing. Protected frontend routes and authorization headers for all private API requests.
- **Dashboard Metrics**: Summary cards for Total, Open, In Progress, and Closed issues. Clicking any metric filters the issues list instantly.
- **Issue CRUD**: Create, read, edit, and delete issues with title, description, status (`Open`, `In Progress`, `Closed`), and priority (`Low`, `Medium`, `High`).
- **User Assignment**: Assign issues to registered users with instant UI updates.
- **Access Visibility**: Only the creator and the assigned user can view the issue on their dashboard.
- **Comments Thread**: Real-time comment stream on each issue with author name and timestamp.
- **Search & Filters**: Real-time search across titles and descriptions with multi-status and priority dropdown filters.
- **Admin Panel**: Dedicated dashboard for admin accounts showing total users, total issues, open issues, and closed issues, along with user management and global issue management.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui components, Lucide icons, React Router v7.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), JSON Web Tokens (JWT), bcryptjs, CORS.
- **Database**: MongoDB Atlas cloud cluster.

---

## Project Architecture

```text
issue-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── adminMiddleware.js    # Admin authorization middleware
│   ├── models/
│   │   ├── Issue.js              # Issue schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── adminRoute.js         # /api/admin stats, users, issues
│   │   ├── authRoute.js          # /signup, /login, /users, /me
│   │   └── issueRoute.js         # /api/issues CRUD, /assign, /comment, /dashboard/stats
│   ├── server.js                 # Express server entry point
│   ├── index.js                  # Entry forwarder
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # AdminLayout.jsx
│   │   │   ├── auth/             # LoginForm.jsx, RegisterForm.jsx
│   │   │   ├── issues/           # IssueModal.jsx, IssueDetailModal.jsx
│   │   │   └── ui/               # Reusable button, card, input, label
│   │   ├── lib/
│   │   │   └── api.js            # Centralized API service with JWT handling
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminUsers.jsx
│   │   │   │   └── AdminIssues.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=8080
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/issue_tracker?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080
```

---

## Local Setup & Run

### 1. Prerequisites

- Node.js (v18+)
- MongoDB connection string (local or MongoDB Atlas)

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Admin Setup

By default, newly registered users have the `role: "user"`. To designate an admin account, update the user's `role` field to `"admin"` directly in MongoDB:

```javascript
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } });
```

Once a user is an admin, an **Admin Panel** link will appear in their dashboard header, and they can also promote/demote other users directly from the Users page in the admin panel.

---

## API Documentation

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Register a new user (`name`, `email`, `password`).
- `POST /api/auth/login` - Authenticate user & return JWT token (`email`, `password`).
- `GET /api/auth/users` - Get list of users for assignment (Protected).
- `GET /api/auth/me` - Get logged-in user profile (Protected).

### Issues (`/api/issues`)

- `GET /api/issues` - Fetch issues (Protected).
- `GET /api/issues/dashboard/stats` - Get counts for total, open, in progress, and closed (Protected).
- `GET /api/issues/:id` - Get specific issue details (Protected).
- `POST /api/issues` - Create a new issue (`title`, `description`, `status`, `priority`) (Protected).
- `PUT /api/issues/:id` - Update issue details (Protected).
- `DELETE /api/issues/:id` - Delete an issue (Protected).
- `POST /api/issues/assign/:id` - Assign issue to a user (`assignedTo`) (Protected).
- `POST /api/issues/comment/:id` - Add a comment to an issue (`text`) (Protected).

### Admin (`/api/admin`) *(Admin Only)*

- `GET /api/admin/stats` - Total users, total issues, open issues, closed issues.
- `GET /api/admin/users` - List all registered users.
- `PATCH /api/admin/users/:id/role` - Update user role (`user` or `admin`).
- `DELETE /api/admin/users/:id` - Delete user account.
- `GET /api/admin/issues` - View all issues across the platform.
- `PUT /api/admin/issues/:id` - Update any issue.
- `DELETE /api/admin/issues/:id` - Delete any issue.

---

## Deployment Guide

### Architecture Overview

- **Database**: MongoDB Atlas (Cloud Database).
- **Backend API**: Hosted on [Render](https://render.com).
- **Frontend App**: Hosted on [Vercel](https://vercel.com).

### Step 1: Deploy Backend (Render)

1. Push your code to GitHub.
2. Sign in to [Render](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to `backend`.
5. Set **Build Command** to `npm install` and **Start Command** to `node server.js`.
6. Under **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `PORT`: `8080`
7. Click **Deploy Web Service** and copy the live URL.

### Step 2: Deploy Frontend (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Set the **Root Directory** to `frontend`.
4. Framework preset will automatically detect **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed backend URL from Step 1.
6. Click **Deploy**.
