import { Request, Response } from 'express';
import * as eventService from '../services/event.service';
import { uploadImage, deleteImage } from '../services/cloudinary.service';
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await eventService.getEventById(req.params.id as string);
    res.json(event);
  } catch (error: any) {
    const status = error.message === 'Event not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    let imageUrl: string | undefined;

    // If image file was uploaded, send it to Cloudinary
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer, 'events');
    }

    const event = await eventService.createEvent(
      { ...req.body, image: imageUrl },
      req.user!.userId
    );
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    let imageUrl: string | undefined;

    if (req.file) {
      // Get old image to delete it from Cloudinary
      const existing = await eventService.getEventById(id);
      if (existing.image) {
        await deleteImage(existing.image);
      }
      imageUrl = await uploadImage(req.file.buffer, 'events');
    }

    const event = await eventService.updateEvent(
      id,
      { ...req.body, ...(imageUrl && { image: imageUrl }) }
    );
    res.json(event);
  } catch (error: any) {
    const status = error.message === 'Event not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const updateEventPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { price } = req.body;
    if (!price || price <= 0) {
      res.status(400).json({ message: 'Valid price is required' });
      return;
    }
    const event = await eventService.updateEventPrice(req.params.id as string, price);
    res.json(event);
  } catch (error: any) {
    const status = error.message === 'Event not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    await eventService.deleteEvent(req.params.id as string);
    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    const status = error.message === 'Event not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};