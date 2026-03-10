const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const nlpEvalRoutes = require('./routes/nlpEvalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any localhost port (for Vite :5173, Flutter web :random port, etc.)
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    // Allow your Vercel production URL
    if (origin === 'https://linguaable.vercel.app') return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.options('(.*)', cors());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected (LinguaAble)'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/eval', nlpEvalRoutes);
app.use('/api/ai', aiRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`));