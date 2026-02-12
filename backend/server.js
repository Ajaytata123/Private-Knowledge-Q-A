require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Basic API configuration and middleware setup
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
    process.env.FRONTEND_URL,
    'https://privateqa.netlify.app'
].map(o => o?.trim().replace(/\/$/, '')).filter(Boolean);

console.log('📡 Allowed Origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.trim().replace(/\/$/, '');

        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.log('⚠️ Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper: Get user's private upload directory
const getSessionDir = (sessionId) => {
    const safeSessionId = (sessionId || 'default').replace(/[^a-z0-9_-]/gi, '_');
    const userPath = path.join(__dirname, 'uploads', safeSessionId);
    if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath, { recursive: true });
    }
    return userPath;
};

// File upload configuration using Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const sessionId = req.headers['x-session-id'] || 'default';
        cb(null, getSessionDir(sessionId));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Helper: Scan directory for user's documents
const getSessionDocuments = (sessionId) => {
    const sessionDir = getSessionDir(sessionId);
    if (!fs.existsSync(sessionDir)) return [];

    const files = fs.readdirSync(sessionDir);
    return files
        .filter(f => f !== '.DS_Store' && f.includes('-'))
        .map(filename => {
            const filePath = path.join(sessionDir, filename);
            const stats = fs.statSync(filePath);
            const originalName = filename.substring(filename.indexOf('-') + 1);
            return {
                id: filename.split('-')[0],
                name: originalName,
                filename: filename,
                path: filePath,
                size: stats.size,
                uploadDate: stats.mtime
            };
        });
};

// Helper: Read file content safely
const readFileContent = (filePath) => {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return "";
    }
};

// Logic to split documents into manageable chunks for the AI model
const chunkDocument = (text, docId, docName) => {
    const rawChunks = text.split(/\n\s*\n/);
    return rawChunks
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 50)
        .map(chunk => ({
            id: docId,
            name: docName,
            text: chunk
        }));
};

// Helper: Call Gemini API directly via REST
const callGeminiAPI = (prompt) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
                        const text = parsed.candidates[0].content.parts[0].text;
                        resolve(text);
                    } else if (parsed.error) {
                        reject(new Error(`Gemini API Error: ${parsed.error.message}`));
                    } else {
                        reject(new Error('Unexpected API response format'));
                    }
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${err.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

// Routes

// Root Welcome Route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #2563eb;">Private QA Backend is Live! 🚀</h1>
            <p>The API is running and ready for connections.</p>
            <hr style="max-width: 400px; margin: 20px auto; opacity: 0.2;">
            <p style="color: #64748b; font-size: 14px;">Use <b>/api/health</b> to check status.</p>
        </div>
    `);
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'operational',
            gemini: GEMINI_API_KEY ? 'connected' : 'disconnected'
        }
    });
});

// Upload Document
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const sessionId = req.headers['x-session-id'] || 'default';
    const originalName = req.file.filename.substring(req.file.filename.indexOf('-') + 1);

    const newDoc = {
        id: req.file.filename.split('-')[0],
        name: originalName,
        size: req.file.size,
        uploadDate: new Date()
    };

    console.log(`📂 User [${sessionId}] uploaded: ${originalName}`);
    res.status(201).json({ message: 'File uploaded successfully', document: newDoc });
});

// List Documents
app.get('/api/documents', (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    const docs = getSessionDocuments(sessionId);
    res.json(docs);
});

// Delete Document
app.delete('/api/documents/:id', (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    const docId = req.params.id;
    const sessionDir = getSessionDir(sessionId);

    // Find file starting with this id
    const files = fs.readdirSync(sessionDir);
    const targetFile = files.find(f => f.startsWith(docId));

    if (!targetFile) {
        return res.status(404).json({ error: 'Document not found' });
    }

    fs.unlinkSync(path.join(sessionDir, targetFile));
    res.json({ message: 'Document deleted successfully' });
});

// Core Q&A endpoint utilizing RAG (Retrieval-Augmented Generation) logic
app.post('/api/ask', async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(503).json({
            error: 'AI service not configured. Please add GEMINI_API_KEY to .env file.'
        });
    }

    try {
        // 1. Prepare Context from User's Private Documents
        const sessionId = req.headers['x-session-id'] || 'default';
        const userDocs = getSessionDocuments(sessionId);
        let allChunks = [];
        userDocs.forEach(doc => {
            const content = readFileContent(doc.path);
            const chunks = chunkDocument(content, doc.id, doc.name);
            allChunks.push(...chunks);
        });

        if (allChunks.length === 0) {
            return res.json({
                answer: "I don't have enough context. Please upload some documents first.",
                sources: []
            });
        }

        // 2. Simple Relevance Scoring
        const questionTerms = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const scoredChunks = allChunks.map(chunk => {
            let score = 0;
            const chunkLower = chunk.text.toLowerCase();
            questionTerms.forEach(term => {
                if (chunkLower.includes(term)) score += 1;
            });
            return { ...chunk, score };
        });

        // Top 5 Chunks
        const topChunks = scoredChunks
            .filter(c => c.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const contextText = topChunks.map((c, i) => `Source ${i + 1} (${c.name}):\n${c.text}`).join("\n\n");

        // 3. Call Gemini via Direct REST API
        let answerText = "";
        let successModel = "";

        try {
            console.log(`Calling Gemini API via REST...`);

            const prompt = `You are a helpful AI assistant. Answer the user's question based ONLY on the provided context snippets. 
If the answer is not in the context, say "I couldn't find the answer in the provided documents."
Do not make up information.

Context:
${contextText}

Question: ${question}

Answer:`;

            answerText = await callGeminiAPI(prompt);
            successModel = "gemini-2.5-flash-preview";
            console.log(`✓ Success with Gemini 2.5 Flash Preview!`);

        } catch (geminiErr) {
            console.log(`✗ Gemini failed: ${geminiErr.message}`);
        }

        // 4. Enhanced Fallback with Clear Summary Points
        if (!answerText) {
            console.log("Gemini unavailable. Using intelligent text retrieval with enhanced formatting.");
            if (topChunks.length > 0) {
                // Create structured summary points
                const summaryPoints = topChunks.slice(0, 3).map((chunk, i) => {
                    const cleanText = chunk.text
                        .replace(/[#*`]/g, '') // Remove markdown symbols
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();

                    const excerpt = cleanText.length > 200
                        ? cleanText.substring(0, 200) + '...'
                        : cleanText;

                    return `**${i + 1}. From "${chunk.name}":**\n\n${excerpt}`;
                }).join('\n\n---\n\n');

                answerText = `## 📋 Key Information Found\n\n${summaryPoints}\n\n---\n\n💡 **Note:** These are the most relevant excerpts from your documents. AI summarization is temporarily unavailable, but these direct quotes should help answer your question.`;
            } else {
                answerText = "## ❌ No Relevant Information Found\n\nI couldn't find any content in your documents that matches your question.\n\n**Suggestions:**\n\n• Upload more documents related to your question\n• Rephrase your question using different keywords\n• Check if your documents contain the information you're looking for";
            }
        }

        // 5. Response
        res.json({
            answer: answerText,
            sources: topChunks.map(c => ({
                documentId: c.id,
                documentName: c.name,
                snippet: c.text.substring(0, 150) + "...",
                score: c.score
            })),
            model: successModel || 'text-retrieval-fallback'
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal processing error: ' + error.message });
    }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n--------------------------------------`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`✅ Gemini API: ${GEMINI_API_KEY ? 'CONFIGURED' : 'MISSING'}`);
    console.log(`--------------------------------------\n`);
});
