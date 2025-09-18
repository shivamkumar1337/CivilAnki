const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'],
//   credentials: true
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and mount auth routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/ProfileRoutes');

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
