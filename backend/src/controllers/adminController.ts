import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Must match name in adminRoutes: getPendingAgents
export const getPendingAgents = async (req: Request, res: Response) => {
    try {
        const agents = await prisma.user.findMany({ 
            where: { status: 'PENDING', role: 'AGENT' } 
        });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending agents" });
    }
};

// Must match name in adminRoutes: updateAgentStatus
export const updateAgentStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating agent status" });
    }
};

// Must match name in adminRoutes: getPendingProperties
export const getPendingProperties = async (req: Request, res: Response) => {
    try {
        const properties = await prisma.listing.findMany({ 
            where: { status: 'PENDING' } 
        });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending properties" });
    }
};

// Must match name in adminRoutes: updatePropertyStatus
export const updatePropertyStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
        const updated = await prisma.listing.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error updating property status" });
    }
};