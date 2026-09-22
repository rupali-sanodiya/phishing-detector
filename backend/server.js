import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Absolute path se .env file load karein
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key Status:", apiKey ? "Key Loaded Successfully ✅" : "Key is MISSING ❌");

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);

// Live Threat Intel Ticker Feed API
const liveThreatAlerts = [
  "🚨 ALERT: Digital Arrest Scams on the rise! Law enforcement agencies never video-call for interrogations or demand money transfers.",
  "📦 CAUTION: Fake FedEx & Customs Parcel Scams targeting citizens with claims of illegal contraband in seized packages.",
  "🌾 NOTICE: Verify authentic MP E-Uparjan portals before submitting wheat procurement or MSP registration details.",
  "⚠️ WARNING: Fake APK files spreading via WhatsApp promising electricity bill rebates or KYC updates. Do not install!",
  "💳 FRAUD ALERT: Credit card reward point redemption scams are active. Never share OTP or UPI PIN with callers."
];

app.get('/api/threat-ticker', (req, res) => {
  // Aap yahan chahein toh database se ya kisi external cyber security feed se bhi data fetch kar sakte hain
  res.json({
    success: true,
    alerts: liveThreatAlerts,
    lastUpdated: new Date().toISOString()
  });
});


app.post('/api/analyze', async (req, res) => {
  try {
    const { content, inputData } = req.body;
    const textToAnalyze = content || inputData;

    if (!textToAnalyze || textToAnalyze.trim() === '') {
      return res.status(400).json({ error: 'Input data is required' });
    }

    const prompt = `
      Analyze the following text, message, email, or URL for phishing, scam, or fraud indicators.
      Input to analyze: "${textToAnalyze}"

      Return the response STRICTLY as a valid JSON object without any extra markdown formatting or backticks, with the following exact keys:
      - "isPhishing": boolean (true if malicious/suspicious, false if safe)
      - "riskScore": number (from 0 to 100, where 100 is high risk)
      - "verdict": string (e.g., "Credential Phishing", "Financial Scam", "Safe / Clean", "Suspicious Link")
      - "summary": string (short description of the finding)
      - "indicators": array of strings (short points explaining threats, empty array if safe)
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text().trim();
    
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const analysisResult = JSON.parse(rawText);
    res.json(analysisResult);

  } catch (error) {
    console.error("Detailed API Error:", error);
    res.status(500).json({ error: error.message || 'Internal Server Error while analyzing data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running smoothly on port ${PORT}`);
});