import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extending Request type to include user if not defined globally
// Updated AuthRequest to match the global requirement
interface AuthRequest extends Request {
  user: {
    id: string;
    role: string; // Removed the '?' to make it mandatory
  };
}

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await prisma.listing.findMany({
      where: { status: 'APPROVED' },
      include: { agent: { select: { fullName: true, phone: true, whatsapp: true } } }
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties" });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, propertyType, listingType, area, images } = req.body;
    
    const newProperty = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        propertyType,
        listingType,
        area,
        images,
        agentId: req.user!.id,
        status: 'PENDING'
      }
    });

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: "Error creating listing" });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Explicitly cast id as string to satisfy Prisma and TypeScript
    const updatedProperty = await prisma.listing.update({
      where: { 
        id: id as string, 
      },
      data: {
        ...req.body,
        // Ensure the agent can only update their own property
        agentId: req.user!.id 
      }
    });

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: "Error updating property or access denied" });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Use deleteMany to filter by both ID and AgentID for security
    // Prisma's 'delete' only allows 'id', but 'deleteMany' allows multiple filters
    const result = await prisma.listing.deleteMany({
      where: { 
        id: id as string, 
        agentId: req.user!.id 
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property" });
  }
};