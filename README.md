# 🏛️ People's Priorities

**AI for Constituency Development Planning**

*A centralized, intelligent decision-support system empowering citizens to report issues and enabling government officials to make data-driven, prioritized development decisions.*

Built for the **Build with AI Code for Communities** Hackathon.

---

## ✨ Features

- **🗣️ Multilingual & Multimodal Citizen Portal**: Citizens can submit requests in 10+ Indian languages. The platform natively supports image uploads (powered by Gemini Vision) to automatically detect visual severity (e.g. assessing the danger of a pothole from a photo).
- **🧠 Explainable AI (XAI) Prioritization**: Every submitted issue is automatically analyzed by Gemini 2.5 Flash to determine its **Priority Score (1-100)**, Sentiment, and Urgency. It also generates a human-readable explanation justifying the score.
- **📊 Live MP Command Center**: A sleek, dark-mode dashboard featuring an interactive Mapbox/Leaflet heatmap, dynamic Recharts for category distribution, and a prioritized action list.
- **💬 Conversational AI Assistant**: Officials can use the floating Chat Assistant to ask natural language questions about their live constituency data (e.g., *"Which sector has the most critical water issues today?"*), powered by real-time RAG context.

---

## 🏗️ Tech Stack

- **Frontend**: [Next.js (App Router)](https://nextjs.org/) + Tailwind CSS + Framer Motion + Recharts + Leaflet
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: SQLite + SQLAlchemy (Local Persistence)
- **AI / LLM**: [Google Gemini 2.5 Flash](https://aistudio.google.com/) (Multimodal Vision & Chat)

---

## 🚀 Getting Started

To run this project locally, you will need two terminal windows: one for the Next.js frontend and one for the FastAPI backend.

### Prerequisites
- Node.js v18+
- Python 3.9+
- A Google Gemini API Key

### 1. Backend Setup (FastAPI)

Navigate to the backend directory and set up a virtual environment:
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder and add your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```

Start the FastAPI server:
```bash
python -m uvicorn main:app --reload
```
*The backend will run on http://localhost:8000. Note: Upon first startup, it will generate a `issues.db` file. You can optionally run `python seed.py` to populate it with realistic mock data!*

### 2. Frontend Setup (Next.js)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

*The frontend will run on http://localhost:3000.*

---

## 📱 Usage

1. Open `http://localhost:3000` to see the Landing Page.
2. Navigate to the **Citizen Portal** (`/report`) to submit a mock issue (try uploading a photo!).
3. Navigate to the **MP Dashboard** (`/dashboard`) to view the heatmap, charts, and interact with the AI Chat Assistant.

---

