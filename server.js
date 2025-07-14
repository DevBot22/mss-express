import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import scheduleRoutes from './routes/schedule.route.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import job from './utils/cron.js';

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") job.start();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

app.get('/', (req, res)=> {
    res.send("Welcome to the MSS-express-backend")
})

//  Routes
app.use('/api/schedules', scheduleRoutes);
app.use('/api/auth', authRoutes)  
app.use('/api/users', userRoutes)

// MongoDB Connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Express server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Stop the app if DB fails
  }
};

connectToDatabase();

export default app;
