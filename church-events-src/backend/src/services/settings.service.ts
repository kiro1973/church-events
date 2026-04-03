import prisma from '../prisma';
import { uploadImage, deleteImage } from './cloudinary.service';
import { UpdateSettingsInput } from '../types';

export const getSettings = async () => {
  // Always returns the first (and only) settings record
  const settings = await prisma.settings.findFirst();
  if (!settings) throw new Error('Settings not configured');
  return settings;
};

export const updateSettings = async (input: UpdateSettingsInput) => {
  const settings = await prisma.settings.findFirst();
  if (!settings) throw new Error('Settings not configured');

  return prisma.settings.update({
    where: { id: settings.id },
    data: input
  });
};

export const updateHeroImage = async (fileBuffer: Buffer) => {
  const settings = await prisma.settings.findFirst();
  if (!settings) throw new Error('Settings not configured');

  // Delete old image if exists
  if (settings.heroImageUrl) {
    try {
      await deleteImage(settings.heroImageUrl);
    } catch (error) {
      console.error('Error deleting old hero image:', error);
    }
  }

  // Upload new image to Cloudinary
  const heroImageUrl = await uploadImage(fileBuffer, 'hero');

  // Save to database
  return prisma.settings.update({
    where: { id: settings.id },
    data: { heroImageUrl }
  });
};