import prisma from '../prisma';
import { CreateSponsorInput } from '../types';

export const getAllSponsors = async () => {
  return prisma.sponsor.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      order: true,
    }
  });
};

export const getAllSponsorsAdmin = async () => {
  return prisma.sponsor.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      order: true,
      isActive: true,
      createdAt: true,
    }
  });
};

export const createSponsor = async (input: CreateSponsorInput) => {
  return prisma.sponsor.create({
    data: {
      name: input.name,
      logoUrl: input.logoUrl,
      order: input.order || 0,
    }
  });
};

export const updateSponsor = async (id: string, input: Partial<CreateSponsorInput> & { isActive?: boolean }) => {
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (!sponsor) throw new Error('Sponsor not found');

  return prisma.sponsor.update({
    where: { id },
    data: input
  });
};

export const deleteSponsor = async (id: string) => {
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (!sponsor) throw new Error('Sponsor not found');

  return prisma.sponsor.delete({ where: { id } });
};