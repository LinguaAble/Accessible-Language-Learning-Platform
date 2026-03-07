const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const nlpEvalRoutes = require('./routes/nlpEvalRoutes');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://linguaable.vercel.app/'  // ← paste your actual Vercel URL here
  ],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected (LinguaAble)'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/eval', nlpEvalRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`));