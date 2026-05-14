# AI Interview PrepAI

A full-stack AI interview preparation app with authentication, conversation-based AI chat, mock interview practice, voice interview mode, resume analysis, and user settings.

## Project Overview

This repository contains two main parts:

- `backend/` — Express API server with MongoDB, JWT auth, interview tracking, AI integration, and resume parsing.
- `frontend/` — React + Vite single page application with protected routes, dark/light theme, chat UI, interview practice interfaces, and voice interview support.

## Key Features

- User registration and login with JWT-based auth
- Persistent auth and protected route access
- AI chat assistant for interview preparation
- Mock interview flow with question generation, answer submission, scoring, and feedback
- Voice interview mode using Web Speech API for microphone input and text-to-speech output
- Resume upload and AI-powered resume analysis
- User preferences including theme switching

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Framer Motion
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, dotenv
- AI: OpenRouter / Gemini API integration via Axios
- Voice: Browser speech recognition and speech synthesis

## Folder Structure

```text
AI Interview PrepAI/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  └─ server.js
│  ├─ package.json
│  └─ .env
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  └─ App.jsx
│  ├─ package.json
│  └─ vite.config.js
└─ README.md
```

## Prerequisites

- Node.js 18+ / npm
- MongoDB instance or MongoDB Atlas connection
- OpenRouter API key or another supported AI service key
- Optional: Google Gemini API key for fallback AI responses

## Backend Setup

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Copy the `.env` file or create a new one with the following values:

```env
PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

4. Start the backend server:

```bash
npm run dev
```

The backend API will run on `http://localhost:5000` by default.

## Frontend Setup

1. Open a terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

4. Open the app in your browser at the URL shown in the terminal (usually `http://localhost:5173`).

## Running the App

- Start backend first, then frontend.
- The frontend is configured to proxy `/api` requests to `http://localhost:5000`.
- Register a new user or login with existing credentials.
- Use the sidebar to navigate to Chat, Mock Interview, Voice Interview, Resume Analyzer, Interview History, and Settings.

## Environment Variables

The backend requires the following environment variables in `backend/.env`:

- `PORT` — server port, for example `5000`
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JSON Web Tokens
- `JWT_EXPIRE` — token expiration, e.g. `7d`
- `OPENROUTER_API_KEY` — OpenRouter API key for AI calls
- `GEMINI_API_KEY` — optional Gemini fallback key
- `NODE_ENV` — `development` or `production`

> Do not commit API keys or secrets to source control.

## Notes

- Voice interview requires a browser that supports the Web Speech API (Chrome, Edge, or compatible browsers).
- AI response speed depends on the configured API provider and network latency.
- The mock interview and chat features rely on the backend AI service.

## Troubleshooting

- If auth fails after refreshing, verify the token is saved in `localStorage` and the backend is reachable.
- If the AI chat or interview is slow, confirm your OpenRouter/Gemini keys are valid and the backend is receiving requests.
- If the voice agent doesn’t work, allow microphone access and use a supported browser.

## Useful Scripts

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## Deployment

### Frontend (Vercel)

1. Open Vercel and import your GitHub repository.
2. Set the root directory to `frontend`.
3. Use:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add an environment variable for the backend URL:
   - `VITE_API_URL=https://<your-backend-url>`
   - Example: `https://my-ai-backend.onrender.com`
5. Deploy the project.

### Backend (Railway / Render / Heroku)

1. Create a new Node.js service on your platform.
2. Connect the GitHub repository and point it to the `backend` folder.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add required environment variables:
   - `PORT` (e.g. `5000`)
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE=7d`
   - `OPENROUTER_API_KEY`
   - `GEMINI_API_KEY` (optional)
   - `CORS_ORIGINS` (comma-separated frontend URL(s), e.g. `https://your-app.vercel.app`)
   - `NODE_ENV=production`
5. Deploy the backend.

### Connect frontend to backend

- Once the backend is deployed, update the frontend API base URL if needed.
- If the frontend is using a proxy in development, add the deployed backend URL in production.

## Future Improvements

- add production build and deployment scripts
- extract AI service configuration into environment-aware settings
- improve resume parsing and error handling
- add tests for backend and frontend flows

---

If you want, I can also add a `CONTRIBUTING.md` or update this README with a quick start example for a deployed environment.