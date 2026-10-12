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
    // Allow production deployments
    const allowed = [
      'https://linguaable.vercel.app',
      'https://frontend-service-704569764751.us-central1.run.app',
      'https://linguaable-704569764751.us-central1.run.app',
      // AWS CloudFront production domain
      'https://d2mrtes5nl38lf.cloudfront.net',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected (LinguaAble)'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/eval', nlpEvalRoutes);
app.use('/api/ai', aiRoutes);
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/test', (req, res) => {
  res.json({ status: 'OK' });
});
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT} (0.0.0.0)`));