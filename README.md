# 🛡️ Legal Guardian

> AI-powered contract analysis for people who sign contracts but don't understand them.

## What It Does

Upload any contract PDF and get:
- **Plain-language summary** in 3–5 bullet points
- **Pros & Cons** — what benefits you vs. what risks you
- **Risk Score** — 0–10 with Low / Moderate / High label
- **Highlighted Clauses** — key sections explained in plain English
- **AI Chat** — ask any follow-up question about the contract
- **Multi-language** output — English, Hindi, Bengali

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + Express |
| AI | Google Gemini 1.5 Flash |
| PDF Parsing | pdf-parse |
| Database | MongoDB + Mongoose |
| Frontend | React + Vite |
| File Upload | Multer (memory storage) |

---

## Project Structure

```
legal-guardian/
├── backend/          # Express API
│   └── src/
│       ├── routes/       # upload, ai, chat
│       ├── controllers/  # request handlers
│       ├── services/     # AI, parser, risk, summary
│       ├── utils/        # PDF parser, cleaner, json fixer
│       ├── middlewares/  # multer, error handler, validator
│       ├── config/       # DB, Gemini, env
│       ├── models/       # User, Document (Mongoose)
│       └── constants/    # prompts, risk levels
└── frontend/         # React app
    └── src/
        ├── components/   # UploadBox, RiskScore, Chat, etc.
        ├── pages/        # Home, Result
        ├── services/     # API calls
        ├── hooks/        # useUpload
        └── utils/        # formatResponse
```

---

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/upload` | Upload PDF, returns extracted text |
| `POST` | `/api/analyze` | Analyze contract text |
| `POST` | `/api/chat` | Ask follow-up question |

### POST /api/upload
```
Content-Type: multipart/form-data
Body: contract (PDF file)
```

### POST /api/analyze
```json
{
  "contractText": "...",
  "filename": "contract.pdf",
  "userType": "freelancer",
  "language": "English"
}
```

### POST /api/chat
```json
{
  "contractText": "...",
  "question": "Can I cancel this contract?",
  "history": [],
  "language": "English"
}
```

---

## Getting a Gemini API Key

1. Go to https://aistudio.google.com/
2. Click **Get API Key**
3. Create a new API key
4. Paste into `.env` as `GEMINI_API_KEY`

---

## Getting a MongoDB URI

Use [MongoDB Atlas](https://cloud.mongodb.com) (free tier):
1. Create cluster
2. Database Access → Add user
3. Network Access → Allow 0.0.0.0/0
4. Connect → Drivers → Copy URI

---

## ⚠️ Disclaimer

Legal Guardian is an AI tool for educational and informational purposes only. It does not provide legal advice. Always consult a licensed attorney before signing any contract.
