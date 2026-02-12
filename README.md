# Private Knowledge Q&A System

A secure, private document intelligence platform that allows you to upload sensitive documents and query them using Google Gemini AI. This project implements a Retrieval-Augmented Generation (RAG) architecture to provide accurate answers with direct source citations.

## 🚀 Key Features

- **Private Document Intelligence**: Query your own documents without them being part of a public training set.
- **AI-Powered Search**: Utilizes Google Gemini's latest models for natural language understanding and generation.
- **Smart Retrieval**: Implements keyword-based scoring and ranking to find the most relevant document sections.
- **Source Citations**: Every answer includes direct links and snippets from the source documents for verification.
- **Modern Sleek UI**: A premium, responsive interface with glassmorphism design and smooth animations.
- **Secure by Design**: Environment-based configuration ensuring API keys and sensitive data remain protected.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, Multer (for file processing)
- **AI Engine**: Google Gemini API (REST integration)
- **Developer Tools**: Axios, Dotenv, Concurrently

## 📋 PRD Compliance

| Requirement | Status | Description |
| :--- | :--- | :--- |
| **Document Upload** | ✅ | Support for .txt and .md files with size validation. |
| **Document List** | ✅ | Full management with metadata (size, date) and delete capability. |
| **AI Q&A** | ✅ | Intelligent retrieval with fallback mechanisms for high reliability. |
| **Source Attribution** | ✅ | Clear Citations with relevance matching and content snippets. |
| **System Health** | ✅ | Real-time monitoring of backend and AI services. |
| **Modern Design** | ✅ | Sleek, professional UI with responsive layout. |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mini-project-private-knowledge-qa
   ```

2. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**:
   - Navigate to the `backend` folder.
   - Create a `.env` file based on `.env.example`.
   - Add your `GEMINI_API_KEY`.

### Running Locally

From the root directory, run:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## 📁 Project Structure

```text
├── backend/            # Express server & AI integration
│   ├── uploads/        # Document storage
│   └── server.js       # Main API logic
├── frontend/           # React SPA
│   ├── src/            # Components & Application logic
│   └── index.css       # Design system & styles
└── .gitignore          # Protected files & directories
```

## 🔒 Security & Best Practices

- **Never** commit your `.env` file to version control. It is already included in `.gitignore`.
- Provide a `.env.example` file for other developers to know what variables are needed.
- The system includes a fallback mechanism that ensures document search works even if the AI service is unavailable.
- All document processing is handled locally on your server.

## 📦 How to Push to GitHub

To safely share this project while keeping your secrets hidden, follow these steps:

1. **Initialize Git** (if not already done):
   ```bash
   git init
   ```
2. **Verify .gitignore**: Ensure `.env` and `node_modules` are ignored.
3. **Add all files**:
   ```bash
   git add .
   ```
4. **Commit with a professional message**:
   ```bash
   git commit -m "feat: implement secure document Q&A system with Gemini RAG"
   ```
5. **Connect to your repository and push**:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```

---

Built with ❤️ for secure knowledge management.
