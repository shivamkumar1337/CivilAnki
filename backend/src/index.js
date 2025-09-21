const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.URL || 'localhost';

// // Middleware
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://localhost:19006', 'exp://192.168.1.100:19000'],
//   credentials: true
// }));

app.use(cors({
  origin: '*', // or specify your Expo dev URL
  // credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and mount auth routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/ProfileRoutes');
const subjectRoutes = require('./routes/SubjectRoutes');
const topicsRoutes = require('./routes/topicsRoutes');
const questionsRoutes = require('./routes/questionsRoutes');
const progressRoutes = require('./routes/progressRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
// const spaceRepetitionRoutes = require('./routes/spaceRepetitionRoutes');

app.use('/progress', progressRoutes);
app.use('/questions', questionsRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/subjects', subjectRoutes);
app.use('/topics', topicsRoutes);
app.use('/settings', settingsRoutes);
// app.use('/spaced-repetition', spaceRepetitionRoutes);

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
