import { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';

// Public — frontend needs churchName, instapayLink, cashPhone
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await settingsService.getSettings();
    // Only expose what public needs
    res.json({
      churchName: settings.churchName,
      instapayLink: settings.instapayLink,
      cashPhone: settings.cashPhone,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      heroImageUrl: settings.heroImageUrl,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Protected — only Responsible + Admin can update
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Protected — upload hero image
export const uploadHeroImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }
    const heroImageUrl = await settingsService.updateHeroImage(req.file.buffer);
    res.json({ heroImageUrl });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};