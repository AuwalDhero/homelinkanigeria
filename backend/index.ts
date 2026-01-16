import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express() as any;
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`HomeLinka Backend running on port ${PORT}`);
});