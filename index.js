require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowed }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/posts', require('./routes/posts'));

// Central error handler: check THIS terminal for stack traces on 500s
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
