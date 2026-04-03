import prisma from '../prisma';
import { CreateEventInput, UpdateEventInput } from '../types';

export const getAllEvents = async () => {
  return prisma.event.findMany({
    orderBy: { date: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      location: true,
      image: true,
      rows: true,
      cols: true,
      price: true,
      createdAt: true,
      _count: {
        select: { seats: true, bookings: true }
      }
    }
  });
};

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      descriptionContent: true,
      date: true,
      location: true,
      image: true,
      rows: true,
      cols: true,
      price: true,
      createdAt: true,
      seats: {
        select: {
          id: true,
          row: true,
          col: true,
          status: true,
        },
        orderBy: [{ row: 'asc' }, { col: 'asc' }]
      },
      _count: {
        select: { bookings: true }
      }
    }
  });

  if (!event) throw new Error('Event not found');
  return event;
};

export const createEvent = async (
  input: CreateEventInput,
  createdById: string
) => {
  // Create event and all its seats in one transaction
  // Transaction = all or nothing, if seats fail, event is rolled back too
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: input.title,
        description: input.description,
        descriptionContent: input.descriptionContent,
        date: new Date(input.date),
        location: input.location,
        image: input.image,
        rows: input.rows,
        cols: input.cols,
        price: input.price,
        createdById,
      }
    });

    // Generate all seats for this event based on rows x cols
    const seats = [];
    for (let row = 1; row <= input.rows; row++) {
      for (let col = 1; col <= input.cols; col++) {
        seats.push({
          eventId: event.id,
          row,
          col,
          status: 'AVAILABLE' as const,
        });
      }
    }

    // createMany inserts all seats in one DB query — much faster than a loop
    await tx.seat.createMany({ data: seats });

    return event;
  });
};

export const updateEvent = async (id: string, input: UpdateEventInput) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error('Event not found');

  return prisma.event.update({
    where: { id },
    data: {
      ...input,
      date: input.date ? new Date(input.date) : undefined,
    }
  });
};

export const updateEventPrice = async (id: string, price: number) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error('Event not found');

  return prisma.event.update({
    where: { id },
    data: { price }
  });
};

export const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error('Event not found');

  // Cascade delete will remove all seats and bookings too
  return prisma.event.delete({ where: { id } });
};