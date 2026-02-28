const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = 3003;

// --- GEMINI CONFIGURATION ---
// Replace 'YOUR_GEMINI_API_KEY' with your actual key from Google AI Studio
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest", // This alias always points to the newest Flash model
    generationConfig: { responseMimeType: "application/json" } 
});

// Configure storage for uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/** * 🧠 AI ANALYSIS ENGINE
 * Sends the transaction text to Gemini and asks for a structured JSON response.
 */
async function runGeminiAnalysis(transactionText) {
    const prompt = `
    Act as a 'Vampire Expense Hunter'. Identify every wasteful expense.
    
    CRITERIA FOR WASTE:
    1. Subscriptions: Netflix, Spotify, Prime, etc.
    2. Convenience: Zomato, Swiggy, Starbucks, Uber.
    3. Shopping: Amazon, Zara, Myntra.
    4. Fees: Bank charges, penalties.

    Return a JSON object with this EXACT structure:
    {
      "summary": { "totalChecked": number, "wastefulCount": number },
      "items": [
        {
          "originalIndex": number,
          "rawContent": "original line text",
          "isWasteful": true/false,
          "category": "Subscription|Convenience|Shopping|Fees|None", 
          "reasoning": "Explain why this is waste"
        }
      ],
      "subscriptions": [
        { "name": "Name of service", "amount": number }
      ]
    }
    
    Transactions:
    ${transactionText}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Safety: Sometimes Gemini wraps JSON in backticks
        text = text.replace(/```json|```/g, "").trim();
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
const PYTHON_API_BASE = 'http://127.0.0.1:5000';

// --- ROUTES ---

app.get('/api/customers', async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_API_BASE}/customers`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

app.get('/api/months', async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_API_BASE}/months`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch months' });
    }
});

// POST /analyze - For file uploads
app.post('/analyze', upload.single('statement'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const content = req.file.buffer.toString('utf-8');
        const results = await runGeminiAnalysis(content);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'AI Analysis failed' });
    }
});

// POST /analyze-api - For fetching from Python backend
app.post('/analyze-api', async (req, res) => {
    const { customer, month } = req.body;
    if (!customer || !month) {
        return res.status(400).json({ error: 'Customer and Month are required' });
    }

    try {
        const response = await fetch(`${PYTHON_API_BASE}/statement/${customer}/${month}`);
        if (!response.ok) throw new Error('Bank API request failed');

        const data = await response.json();

        // Convert JSON transactions to a single string for Gemini
        const transactionText = data.transactions.map((t, i) => 
            `Line ${i+1}: ${t.date} | ${t.description} | ${t.amount} | ${t.type}`
        ).join('\n');

        const results = await runGeminiAnalysis(transactionText);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze statement from AI' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index3.html'));
});

app.listen(PORT, () => {
    console.log(`🧛 AI Wasteful Expense Analyzer running at http://localhost:${PORT}`);
    console.log(`🤖 Gemini AI integrated for semantic analysis`);
});