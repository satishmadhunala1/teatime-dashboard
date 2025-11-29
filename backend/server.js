const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* ---------------------------------------
   SIMPLE & WORKING CORS SETUP (NO .env)
   ---------------------------------------
   Step 1 (before frontend deploy):
        allow all = "*"

   Step 2 (after frontend deploy):
        change "*" → your Vercel URL
------------------------------------------ */

app.use(cors({
  origin: "*",   // CHANGE THIS LATER to your Vercel URL
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/news', require('./routes/news'));

app.get('/', (req, res) => {
  res.send('Welcome to the Bilingual News Auto-Fetcher API');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date(),
    service: 'Bilingual News Auto-Fetcher'
  });
});

// DB connection
mongoose.connect('mongodb://localhost:27017/bilingual-news')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
