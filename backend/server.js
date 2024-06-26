import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai-preview';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

// Initialize FirebaseApp
const firebaseApp = initializeApp(firebaseConfig);

// Initialize the Vertex AI service
const vertexAI = getVertexAI(firebaseApp);

// Initialize the generative model with a model that supports your use case
const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

const app = express();
app.use(cors());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Converts a Buffer to a Part object for the API
const bufferToGenerativePart = async (buffer, mimeType) => ({
  inlineData: { data: buffer.toString('base64'), mimeType }
});

// Endpoint for file upload and processing with Vertex AI
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const parts = await Promise.all(
      files.map(file => bufferToGenerativePart(file.buffer, file.mimetype))
    );

    const prompt = "Generate only multiple choice quiz questions from the provided content in JSON format with fields for question, answer choices, and correct answer. Ensure that the questions are different from the provided material and that every question has either a true/false answer or a mutiple choice answer.";
    const inputParts = [prompt, ...parts];

    const response = await model.generateContentStream(inputParts);

    let result = '';
    for await (const chunk of response.stream) {
      result += chunk.text();
    }

    const jsonResponse = JSON.parse(result.replace(/```json|```/g, '').trim());

    res.status(200).json({ message: 'Files processed successfully', data: jsonResponse });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ message: 'Error processing files', error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to QuizForge API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
