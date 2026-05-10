import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getTrips = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10', status } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const now = new Date();

  const where: any = { userId: req.userId };
  if (status === 'upcoming') where.startDate = { gt: now };
  if (status === 'ongoing') where.AND = [{ startDate: { lte: now } }, { endDate: { gte: now } }];
  if (status === 'completed') where.endDate = { lt: now };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { stops: { include: { city: true }, orderBy: { orderIndex: 'asc' } } },
    }),
    prisma.trip.count({ where }),
  ]);

  res.json({ trips, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          stopActivities: { include: { activity: true } },
          tripNotes: true,
        },
      },
      expenses: { orderBy: { date: 'asc' } },
      packingItems: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json(trip);
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  const { name, description, coverImage, startDate, endDate, totalBudget, isPublic } = req.body;
  const trip = await prisma.trip.create({
    data: {
      userId: req.userId!,
      name,
      description,
      coverImage,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      totalBudget,
      isPublic: isPublic ?? false,
      shareToken: uuidv4(),
    },
  });
  res.status(201).json(trip);
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const updated = await prisma.trip.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    },
  });
  res.json(updated);
};

export const deleteTrip = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  await prisma.trip.delete({ where: { id: req.params.id } });
  res.json({ message: 'Trip deleted' });
};

export const duplicateTrip = async (req: AuthRequest, res: Response) => {
  const original = await prisma.trip.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      stops: { include: { stopActivities: true } },
      packingItems: true,
    },
  });
  if (!original) return res.status(404).json({ error: 'Trip not found' });

  const newTrip = await prisma.trip.create({
    data: {
      userId: req.userId!,
      name: `${original.name} (Copy)`,
      description: original.description,
      coverImage: original.coverImage,
      totalBudget: original.totalBudget,
      shareToken: uuidv4(),
      stops: {
        create: original.stops.map((stop: any) => ({
          cityId: stop.cityId,
          orderIndex: stop.orderIndex,
          notes: stop.notes,
          stopActivities: {
            create: stop.stopActivities.map((sa: any) => ({
              activityId: sa.activityId,
              customCost: sa.customCost,
            })),
          },
        })),
      },
      packingItems: {
        create: original.packingItems.map(({ id: _id, tripId: _tripId, ...item }: any) => item),
      },
    },
    include: { stops: { include: { city: true } } },
  });
  res.status(201).json(newTrip);
};

export const getPublicTrip = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.findFirst({
    where: { shareToken: req.params.token, isPublic: true },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: { city: true, stopActivities: { include: { activity: true } } },
      },
    },
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found or not public' });
  res.json(trip);
};

export const getPublicFeed = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '12' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where: { isPublic: true },
      skip,
      take: parseInt(limit),
      orderBy: { likes: 'desc' },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        stops: { include: { city: true }, orderBy: { orderIndex: 'asc' }, take: 3 },
      },
    }),
    prisma.trip.count({ where: { isPublic: true } }),
  ]);
  res.json({ trips, total });
};

export const likeTrip = async (req: AuthRequest, res: Response) => {
  const trip = await prisma.trip.update({
    where: { id: req.params.id },
    data: { likes: { increment: 1 } },
  });
  res.json({ likes: trip.likes });
};
