import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import adminRoutes from './routes/adminRoutes';

// 1. FIX FOR VERCEL & PRISMA: Handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 2. Health Check Route (Good for testing if backend is alive)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'HomeLinka Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);

// 3. Environment logic for Listen
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`HomeLinka Backend running on port ${PORT}`);
  });
}

// 4. Export for Vercel Serverless Functions
export default app;