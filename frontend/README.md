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
- **Full Screen & Responsive**: Fluid layout that works seamlessly across mobile, tablet, and desktop screens.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui components, Lucide icons, React Router v7.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), JSON Web Tokens (JWT), bcryptjs, CORS.
- **Database**: MongoDB Atlas cloud cluster.

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
VITE_API_URL=https://issue-tracker-g2fy.onrender.com
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

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

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

- **Database**: MongoDB Atlas
- **Backend API**: Hosted on [Render](https://render.com) at `https://issue-tracker-g2fy.onrender.com`
- **Frontend App**: Hosted on [Vercel](https://vercel.com) at `https://issue-tracker-lovat-pi.vercel.app`
