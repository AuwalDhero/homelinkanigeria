import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerAgent = async (req: Request, res: Response) => {
  const { fullName, email, password, phone, businessName, whatsapp } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const agent = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone,
        businessName,
        whatsapp,
        status: 'PENDING' // Agents must be approved by Admin
      }
    });

    res.status(201).json({ message: "Registration successful. Awaiting admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Error creating account", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === 'SUSPENDED') return res.status(403).json({ message: "Account suspended" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, role: user.role, status: user.status }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};