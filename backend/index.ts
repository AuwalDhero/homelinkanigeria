import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express(); // Removed 'as any' unless you specifically need it for a library conflict
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);

// Only call app.listen if we are NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`HomeLinka Backend running on port ${PORT}`);
  });
}

// THIS IS THE KEY FOR VERCEL
export default app;