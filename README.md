<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# Waste Expense Analyzer 🎯

## Basic Details

### Team Name: 4knot

### Team Members
- Member 1: Parvathi S - College of Engineering Trivandrum
- Member 2: Neha Susan Koshy - College of Engineering Trivandrum

### Hosted Project Link
[mention your project hosted link here]

### Project Description
An AI-Powered Waste Expense Analyser that identifies "financial leaks" in bank statements. Using the Gemini 3 Flash LLM, it semantically audits transactions to find forgotten subscriptions, impulsive dining, and hidden fees, transforming raw data into a prioritized savings roadmap.

### The Problem statement
Consumers lose significant wealth to "Micro-Transaction Blindness"—small, recurring costs that are easy to ignore but expensive over time.

Subscription Creep: Forgotten digital services (Netflix, iCloud) draining monthly balances.

Convenience Bias: High-frequency, low-cost spending on food delivery (Swiggy/Zomato) that is rarely tracked as a total sum.

Static Tooling: Traditional apps use rigid rules that fail to recognize new brands or complex transaction descriptions

### The Solution
An automated, intelligent auditing pipeline that provides:

Semantic Auditing: Uses Gemini AI to understand the context of spending (e.g., recognizing "Starbucks" as luxury convenience) rather than just matching keywords.

Vampire Detection: Automatically flags recurring "vampire" subscriptions and calculates 6-month savings projections.

Actionable Insights: Categorizes waste into four high-impact buckets (Subscriptions, Convenience, Shopping, Fees) with AI-generated reasoning for every flag.

Unified Dashboard: A responsive web interface that highlights wasteful rows in real-time for immediate user intervention.
---

## Technical Details

**For Software:**
Languages used: JavaScript (Node.js), HTML5, CSS3.

Frameworks used: Express.js (Backend server).

Libraries used: @google/generative-ai (Gemini SDK), multer (File handling), cors (Cross-origin resource sharing).

Tools used: VS Code, Git, Google AI Studio (API Management), Postman (API Testing).

## Features

List the key features of your project:
Feature 1: Semantic AI Auditing Uses the Gemini 3 Flash engine to understand transaction intent (e.g., identifying "Starbucks" as luxury convenience) rather than relying on outdated, rigid keyword matching.

Feature 2: Vampire Subscription Detection Automatically flags recurring digital services (Netflix, Spotify, iCloud) and identifies them as "Vampire" expenses that cause long-term financial leakage.

Feature 3: 6-Month Savings Projection Calculates the cumulative cost of detected waste over a half-year period, providing a tangible "reward" motivation for users to cancel unnecessary services.

Feature 4: Multi-Source Analysis Supports both manual .txt file uploads and direct API integration (via a Python-simulated banking backend) to pull and analyze statements in real-time.

Feature 5: High-Impact Categorization Groups all wasteful spending into four actionable buckets—Subscriptions, Convenience Dining, Impulse Shopping, and Miscellaneous Fees—complete with AI-generated reasoning.

---

Implementation
For Software:
Installation
Navigate to the project folder:

Bash
cd trial1-perp
Install core dependencies:

Bash
npm install express cors multer @google/generative-ai
Configure API Key:
Open server3.js and paste your Gemini API Key:

JavaScript
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
Run
Start the AI Analysis Server:

Bash
python app.py
Access the Application:
Open your browser and go to: http://localhost:3003


## Project Documentation

### For Software:

#### Screenshots

The screenshots provided show step by step how the expense analyser works. First it will require you to upload your bank statement. On attaching the same, it categorise your expenses based on whether they are Essential, a monthly subscription that seems to be draining your account, or a convenience that can be avoided.

#### Diagrams
System Architecture
Architecture Overview:
The system uses a Middleware-as-a-Service pattern to bridge raw financial data with Generative AI:

Frontend: A Vanilla JS interface for file uploads and data rendering.

Backend (Node.js/Express): Orchestrates data flow, manages Multer file parsing, and handles API communication.

AI Engine (Gemini 3 Flash): Processes transaction text semantically via specialized prompts to return structured JSON.

External API (Python): Simulates a core banking database for fetching customer statements.

Application Workflow
Workflow Execution:

Input: User uploads a .txt statement or selects an API-linked customer.

Prompting: The server formats transactions into a "Vampire Hunter" prompt for the LLM.

Analysis: Gemini-3-Flash identifies waste based on context (e.g., distinguishing "Rent" from "Netflix").

Parsing: The AI returns structured JSON containing categories and reasoning.

Output: The UI highlights wasteful rows and calculates a 6-month savings projection.

## Additional Documentation


#### API Documentation

**Base URL:** `http://localhost:3003`

##### Endpoints
GET /api/customers

Description: Fetches a list of available customers from the simulated banking backend.

Parameters: None

Response:

JSON
[
  { "id": "C001", "name": "John Doe" }
]
POST /analyze

Description: Uploads a raw text statement for AI-powered waste analysis.

Parameters: - statement (file): The .txt bank statement file (Multipart/form-data).

Response:

JSON
{
  "summary": { "totalChecked": 10, "wastefulCount": 3 },
  "items": [{ "isWasteful": true, "category": "Subscription", "reasoning": "..." }]
}
POST /analyze-api

Description: Fetches a specific customer's statement from the Python API and runs analysis.

Request Body:

JSON
{
  "customer": "C001",
  "month": "January"
}
Response:

JSON
{
  "summary": { "totalChecked": 15, "wastefulCount": 5 },
  "items": [...]
}

#### Demo Output
Example 1: Manual File Upload

Input (statement.txt):

Plaintext
20/02/2026 | Zomato Order | 450.00 | Debit
21/02/2026 | Netflix India | 199.00 | Debit
22/02/2026 | Electricity Bill | 2500.00 | Debit
Command:

Bash
# Upload via Frontend UI or:
curl -X POST -F "statement=@statement.txt" http://localhost:3003/analyze
Output:

JSON
{
  "summary": { "totalChecked": 3, "wastefulCount": 2 },
  "items": [
    { "originalIndex": 1, "isWasteful": true, "category": "Convenience", "reasoning": "Food delivery is a non-essential luxury expense." },
    { "originalIndex": 2, "isWasteful": true, "category": "Subscription", "reasoning": "Recurring digital entertainment drain." }
  ]
}
Example 2: API-Linked Analysis

Input (Request Body):

JSON
{
  "customer": "C001",
  "month": "February"
}
Command:

Bash
curl -X POST -H "Content-Type: application/json" -d '{"customer":"C001","month":"February"}' http://localhost:3003/analyze-api
Output:

JSON
{
  "summary": { "totalChecked": 15, "wastefulCount": 4 },
  "subscriptions": [
    { "name": "Netflix", "amount": 199 },
    { "name": "Spotify", "amount": 119 }
  ],
  "projected_6mo_savings": 1908
}

## Project Demo

### Video
[Add your demo video link here - YouTube, Google Drive, etc.]

*Explain what the video demonstrates - key features, user flow, technical highlights*

### Additional Demos
[Add any extra demo materials/links - Live site, APK download, online demo, etc.]

---



## Team Contributions

- Parvathi S:  Frontend development, API integration
- Neha Susan Koshy: Backend Development, AI specialist


---

## License

This project is licensed under the [LICENSE_NAME] License - see the [LICENSE](LICENSE) file for details.

**Common License Options:**
- MIT License (Permissive, widely used)
- Apache 2.0 (Permissive with patent grant)
- GPL v3 (Copyleft, requires derivative works to be open source)

---

Made with ❤️ at TinkerHub
