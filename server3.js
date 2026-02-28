const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3003;

// Configure storage for uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
// Serve from root directory
app.use(express.static(__dirname));

/** 
 * 🧛 WASTE DISCOVERY ENGINE (Modular Rules)
 * 4-5 point rule set as requested.
 */
const ANALYSIS_RULES = [
    {
        id: 'recurring',
        name: 'Vampire Subscriptions',
        pattern: /netflix|spotify|prime|hulu|disney|icloud|google.*one|premium/i,
        reason: 'Recurring digital services that bleed you dry monthly.',
        severity: 'high'
    },
    {
        id: 'dining',
        name: 'Convenience Dining',
        pattern: /uber.*eats|zomato|swiggy|pvr|cinemas|inox|starbucks/i,
        reason: 'Premium takeout and entertainment expenses.',
        severity: 'medium'
    },
    {
        id: 'impulse',
        name: 'Impulse Shopping',
        pattern: /zara|myntra|amazon.*shopping|hm|fashion|mall/i,
        reason: 'Retail shopping likely driven by momentary desire.',
        severity: 'medium'
    },
    {
        id: 'rides',
        name: 'Frequent Rides/Top-ups',
        pattern: /uber.*ride|ola.*ride|metro.*recharge|metro.*top-up/i,
        reason: 'High frequency of short-distance travel costs.',
        severity: 'low'
    },
    {
        id: 'misc_waste',
        name: 'Miscellaneous Drain',
        pattern: /fees|penalty|interest|charge/i,
        reason: 'Banking fees or late penalties that provide zero value.',
        severity: 'high'
    }
];

/** 
 * Analysis Engine Function
 * Takes an array of transaction strings and returns flagged results.
 */
function runAnalysis(dataLines) {
    return dataLines.map((line, index) => {
        if (!line || !line.trim()) return null;

        let match = null;
        for (const rule of ANALYSIS_RULES) {
            if (rule.pattern.test(line)) {
                match = {
                    ruleName: rule.name,
                    reason: rule.reason,
                    severity: rule.severity
                };
                break;
            }
        }

        return {
            originalIndex: index + 1,
            rawContent: line,
            isWasteful: !!match,
            wasteDetails: match
        };
    }).filter(item => item !== null);
}

// REST-style proxy to Python Set
const PYTHON_API_BASE = 'http://127.0.0.1:5000';

app.get('/api/customers', async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_API_BASE}/customers`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/months', async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_API_BASE}/months`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// POST /analyze - Accepts text file upload
app.post('/analyze', upload.single('statement'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const content = req.file.buffer.toString('utf-8');
    const lines = content.split('\n');
    // Skip header if it exists
    const dataLines = lines[0].toLowerCase().includes('date') ? lines.slice(1) : lines;

    const results = runAnalysis(dataLines);

    res.json({
        summary: {
            totalChecked: results.length,
            wastefulCount: results.filter(r => r.isWasteful).length,
        },
        items: results
    });
});

// POST /analyze-api - Fetches from Python API and analyzes
app.post('/analyze-api', async (req, res) => {
    const { customer, month } = req.body;
    if (!customer || !month) {
        return res.status(400).json({ error: 'Customer and Month are required' });
    }

    try {
        const response = await fetch(`${PYTHON_API_BASE}/statement/${customer}/${month}`);
        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();

        // Convert JSON transactions to strings for the analysis engine
        const dataLines = data.transactions.map(t =>
            `${t.date} | ${t.description} | ${t.amount} | ${t.type}`
        );

        const results = runAnalysis(dataLines);

        res.json({
            summary: {
                totalChecked: results.length,
                wastefulCount: results.filter(r => r.isWasteful).length,
            },
            items: results
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze statement from API' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index3.html'));
});

app.listen(PORT, () => {
    console.log(`🧛 Wasteful Expense Analyzer running at http://localhost:${PORT}`);
    console.log(`🔗 Proxying to Bank Plus API at ${PYTHON_API_BASE}`);
});
