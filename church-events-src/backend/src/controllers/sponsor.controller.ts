import { Request, Response } from 'express';
import * as sponsorService from '../services/sponsor.service';
import { uploadImage } from '../services/cloudinary.service';

export const getAllSponsors = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsors = await sponsorService.getAllSponsors();
    res.json(sponsors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSponsorsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsors = await sponsorService.getAllSponsorsAdmin();
    res.json(sponsors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    let logoUrl: string = req.body.logoUrl;

    // If image file uploaded, send to Cloudinary
    if (req.file) {
      logoUrl = await uploadImage(req.file.buffer, 'sponsors');
    }

    if (!logoUrl) {
      res.status(400).json({ message: 'Logo image is required' });
      return;
    }

    const sponsor = await sponsorService.createSponsor({
      ...req.body,
      logoUrl,
    });
    res.status(201).json(sponsor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    let logoUrl: string | undefined;

    if (req.file) {
      logoUrl = await uploadImage(req.file.buffer, 'sponsors');
    }

    const sponsor = await sponsorService.updateSponsor(id, {
      ...req.body,
      ...(logoUrl && { logoUrl }),
    });
    res.json(sponsor);
  } catch (error: any) {
    const status = error.message === 'Sponsor not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const deleteSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await sponsorService.deleteSponsor(id);
    res.json({ message: 'Sponsor deleted successfully' });
  } catch (error: any) {
    const status = error.message === 'Sponsor not found' ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};