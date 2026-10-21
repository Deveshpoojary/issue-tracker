# Issue Tracker

A full-stack, responsive issue management application built with React, Vite, Tailwind CSS, Express, MongoDB, and JWT authentication.

---

## Live Links

- **Frontend Deployment (Vercel)**: https://issue-tracker-lovat-pi.vercel.app
- **Backend API (Render)**: https://issue-tracker-g2fy.onrender.com
- **GitHub Repository**: https://github.com/Deveshpoojary/issue-tracker



---

## Project Overview

Issue Tracker is designed for teams to create, track, prioritize, and collaborate on project issues. It features a minimal black-and-white interface, real-time status counters, task assignment, and comment discussions. Tasks are visible strictly to the creator and the assigned user.

---

## Features

- **Authentication & Security**: Secure user signup and login using JWT tokens and bcrypt password hashing. Protected frontend routes and authorization headers for all private API requests.
- **Dashboard Metrics**: Summary cards for Total, Open, In Progress, and Closed issues. Clicking any metric filters the issues list instantly.
- **Issue CRUD**: Create, read, edit, and delete issues with title, description, status (`Open`, `In Progress`, `Closed`), and priority (`Low`, `Medium`, `High`).
- **User Assignment**: Assign issues to registered users with instant UI updates.
- **Access Visibility**: Only the creator and the assigned user can view the issue on their dashboard.
- **Comments Thread**: Real-time comment stream on each issue with author name and timestamp.
- **Search & Filters**: Real-time search across titles and descriptions with multi-status and priority dropdown filters.

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
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── models/
│   │   ├── Issue.js            # Issue schema (title, status, priority, comments, users)
│   │   └── User.js             # User schema (name, email, password)
│   ├── routes/
│   │   ├── authRoute.js        # /signup, /login, /users, /me
│   │   └── issueRoute.js       # /api/issues CRUD, /assign, /comment, /dashboard/stats
│   ├── server.js               # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # LoginForm.jsx, RegisterForm.jsx
│   │   │   ├── issues/         # IssueModal.jsx, IssueDetailModal.jsx
│   │   │   └── ui/             # Reusable button, card, input, label
│   │   ├── lib/
│   │   │   └── api.js          # Centralized API service with JWT handling
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Main full-screen responsive dashboard
│   │   │   ├── Login.jsx       # Login page
│   │   │   └── Register.jsx    # Signup page
│   │   ├── App.jsx             # Router and ProtectedRoute guards
│   │   └── index.css           # Global Tailwind styling & theme tokens
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

*(In production, set `VITE_API_URL` to your deployed backend URL, e.g., `https://your-api.onrender.com`)*

---

## Local Setup & Run

### 1. Prerequisites

- Node.js (v18+)
- MongoDB connection string (local or MongoDB Atlas)

### 2. Backend Setup

```bash
cd backend
npm install
# Create .env file with MONGO_URI and JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
# Create .env file with VITE_API_URL
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## API Documentation

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Register a new user (`name`, `email`, `password`).
- `POST /api/auth/login` - Authenticate user & return JWT token (`email`, `password`).
- `GET /api/auth/users` - Get list of users for assignment (Protected).
- `GET /api/auth/me` - Get logged-in user profile (Protected).

### Issues (`/api/issues`)

- `GET /api/issues` - Fetch all issues (Protected).
- `GET /api/issues/dashboard/stats` - Get counts for total, open, in progress, and closed (Protected).
- `GET /api/issues/:id` - Get specific issue details (Protected).
- `POST /api/issues` - Create a new issue (`title`, `description`, `status`, `priority`) (Protected).
- `PUT /api/issues/:id` - Update issue details (Protected).
- `DELETE /api/issues/:id` - Delete an issue (Protected).
- `POST /api/issues/assign/:id` - Assign issue to a user (`assignedTo`) (Protected).
- `POST /api/issues/comment/:id` - Add a comment to an issue (`text`) (Protected).

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
7. Click **Deploy Web Service** and copy the live URL (e.g., `https://issue-tracker-backend.onrender.com`).

### Step 2: Deploy Frontend (Vercel)

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Set the **Root Directory** to `frontend`.
4. Framework preset will automatically detect **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your deployed backend URL from Step 1 (e.g. `https://issue-tracker-backend.onrender.com`).
6. Click **Deploy**.
7. Your frontend is live at `https://your-project.vercel.app`.

### Updating the Application

- Any push to the `main` branch on GitHub triggers automatic redeployment on both Vercel and Render.
