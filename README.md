# 📩 Inbox AI

AI-powered email inbox cleaner built with Next.js and FastAPI. Paste in your emails and get instant AI analysis — each message is categorized as Urgent, Important, Low Priority, or Spam, with a summary, recommended action, and suggested reply. Powered by Groq's LLaMA 3.1 API.

---

## 🛠 Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** FastAPI (Python)
- **AI Model:** LLaMA 3.1 8B via Groq API

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/randeepc123/AI-Inbox-Organizer.git
cd AI-Inbox-Organizer

### 2. Set up the backend

cd backend
pip install fastapi uvicorn groq python-dotenv

Create a `.env` file inside the `backend` folder:

GROQ_API_KEY=your_groq_api_key_here

Start the backend server:

uvicorn main:app --reload

The backend will run on `http://localhost:8000`.

### 3. Set up the frontend

In a separate terminal:

cd ..
npm install
npm run dev

The frontend will run on `http://localhost:3000`.

---

## 🔑 Getting a Groq API Key

1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to **API Keys** and create a new key
4. Paste it into your `.env` file as shown above

---

## 🚀 Usage

1. Make sure both the backend and frontend are running
2. Open `http://localhost:3000` in your browser
3. Click **"Clean My Inbox"** to analyze the sample emails
4. View AI-generated insights in the right panel

---

## 🔒 Note

Never commit your `.env` file. It is already included in `.gitignore`.
