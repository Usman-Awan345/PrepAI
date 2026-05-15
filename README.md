# 🚀 AI Interview PrepAI

A full-stack **AI-powered interview preparation platform** designed to help developers practice real interview scenarios with **dynamic AI questions, voice interaction, and intelligent evaluation**.

---

## 🔥 What Makes This Project Special

Unlike basic interview apps, this platform:

* Generates **fresh AI questions every session**
* Evaluates answers **based on user input (not static scoring)**
* Provides **correct answers + guidance instantly**
* Supports **voice-based interviews (real interview feel)**
* Tracks performance and improvement

---

## 🧠 Core Features

### 🤖 AI Chat Assistant

* ChatGPT-like conversational interface
* Helps with interview questions, concepts, and explanations
* Fast response handling with error fallback

---

### 🧪 Mock Interview (AI-Based)

* Dynamic **AI-generated questions (different every time)**
* Questions flow: **Easy → Medium → Hard**
* Answer evaluation based on:

  * Accuracy
  * Clarity
  * Completeness
  * Practical understanding
* Each answer includes:

  * ✅ Score (0–10)
  * 💬 Feedback
  * 📘 Correct Answer (short & interview-ready)
  * 🚀 Improvement Tips

---

### 🎙️ Voice Interview Mode

* Real interview simulation
* Uses:

  * **Speech Recognition (user speaks)**
  * **Text-to-Speech (AI speaks)**
* Features:

  * AI stops speaking when user starts talking
  * Voice answer → AI evaluation
  * Submit button (arrow UI)
  * Level selection (Beginner / Medium / Expert)

---

### 📄 Resume Analyzer

* Upload resume (PDF)
* AI analyzes:

  * Skills
  * Weak areas
  * ATS score
  * Improvement suggestions

---

### 📊 Interview History

* Track previous interviews
* View scores and feedback
* Analyze improvement over time

---

### 🎨 UI/UX Features

* Light/Dark mode support (fully optimized)
* Premium UI with Tailwind + animations
* Responsive design
* Smooth transitions (Framer Motion)

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* Axios
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt

### AI Integration

* OpenRouter API (LLMs)
* Gemini API (optional fallback)

### Voice

* Web Speech API

  * SpeechRecognition
  * SpeechSynthesis

---

## 📁 Project Structure

```bash
AI Interview PrepAI/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGODB_URI=your_mongo_url
JWT_SECRET=your_secret
OPENROUTER_API_KEY=your_api_key
GEMINI_API_KEY=optional
NODE_ENV=development
```

Run server:

```bash
npm run dev
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 How It Works

### Mock Interview Flow

1. Select topic
2. Choose level
3. AI generates questions
4. User answers
5. AI evaluates:

   * Score
   * Feedback
   * Correct answer

---

### Voice Interview Flow

1. Select topic + level
2. AI speaks question
3. User answers via microphone
4. AI evaluates response

---

## ⚠️ Important Notes

* AI responses depend on API speed
* Voice interview works best in **Chrome / Edge**
* Always keep API keys secure (backend only)

---

## 🌍 Deployment

### Frontend (Vercel)

* Root: `frontend`
* Build: `npm run build`
* Output: `dist`

### Backend (Render / Railway)

* Start: `npm start`
* Add environment variables

---

## 📈 Future Improvements

* Rate limiting (API protection)
* AI response caching (faster performance)
* Advanced analytics dashboard
* Multi-language support
* Better resume parsing

---

## 👨‍💻 Author

**Usman Akhtar**
MERN Stack Developer

---

## ⭐ Final Note

This project is a **portfolio-level AI product** that demonstrates:

* Real-world AI integration
* Full-stack architecture
* Advanced UI/UX
* Problem-solving logic

---

If you like this project, feel free to ⭐ the repo!
