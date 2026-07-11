# CampusOS

CampusOS is a centralized platform designed to manage student communities, clubs, and organizations like CodeChef, ACM, IEEE, GDSC, and more. It aims to replace scattered tools (Google Forms, WhatsApp, Drive, spreadsheets) with one unified, scalable web application.

## 🚀 Modules

- **User Authentication & Profiles**
- **Event Management**
- **Blogs & Articles**
- **Project Showcase**
- **Leaderboard**
- **Announcements**
- **Gallery**
- **Member Management**
- **Admin Dashboard**

## 🛠️ Technology Stack (MERN)

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB

## 📁 Folder Structure

This repository follows a monorepo structure separating the frontend and backend:

```text
campusos/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration and connection setups
│   │   ├── controllers/     # Route handlers (handles incoming requests/responses)
│   │   ├── middlewares/     # Express middleware functions (auth, error-handling)
│   │   ├── models/          # Database schemas (Mongoose models)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & integrations
│   │   ├── utils/           # Shared utility functions
│   │   └── index.js         # Entry point for backend Express app
│   ├── .env.example         # Template for environment variables
│   └── package.json         # Node package configuration & backend scripts
├── frontend/
│   ├── public/              # Public files (index.html, favicon, etc.)
│   ├── src/
│   │   ├── assets/          # Images, logos, and fonts
│   │   ├── components/      # Reusable visual components (Buttons, Inputs, etc.)
│   │   ├── context/         # React Context providers (auth state, theme state)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # High-level route views (Dashboard, Events, etc.)
│   │   ├── services/        # API request services (Axios/Fetch functions)
│   │   ├── styles/          # Global CSS, themes, variables
│   │   ├── utils/           # Helper functions
│   │   ├── App.js           # Core App layout and routing
│   │   └── index.js         # Entry point for React client
│   ├── .env.example         # Template for frontend environment variables
│   └── package.json         # React dependencies & scripts
├── .gitignore               # Root gitignore rules
└── README.md                # Setup guide and documentation
```

## 🤝 Collaboration & Git Workflow

The primary objective of this project is to learn collaboration and professional engineering workflows.

1. **Issues First:** Every feature or bug fix must start with a GitHub Issue.
2. **Branching:** Create a feature branch from `main` for your work. (e.g., `feature/user-auth` or `fix/login-bug`).
3. **Commits:** Write clear and descriptive commit messages.
4. **Pull Requests:** Open a PR against `main` detailing the changes you made.
5. **Code Review:** Every PR requires a review from at least one teammate before merging. No direct pushes to `main`.
6. **Testing:** Ensure your code works locally before requesting a review.

## ⚙️ Local Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create a `.env` file based on `.env.example`
4. `npm start`
