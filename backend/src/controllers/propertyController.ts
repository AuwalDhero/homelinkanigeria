import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const createProperty = async (req: Request, res: Response) => {
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
        status: 'PENDING' // Listings require Admin review
      }
    });

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: "Error creating listing" });
  }
};

// ADDED THIS FUNCTION
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the property belongs to this agent before updating
    // Note: We normally don't let agents change the 'status' back to APPROVED themselves
    const updatedProperty = await prisma.listing.update({
      where: { 
        id: id,
        agentId: req.user!.id // Security: Ensure agent owns this listing
      },
      data: req.body
    });

    res.json(updatedProperty);
  } catch (error) {
    // If record not found (or doesn't belong to user), Prisma throws an error
    res.status(500).json({ message: "Error updating property or access denied" });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    await prisma.listing.delete({
      where: { 
        id: req.params.id, 
        agentId: req.user!.id // Security: Ensure agent owns this listing
      }
    });
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property" });
  }
};