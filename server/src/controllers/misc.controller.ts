import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// ── EXPENSES ──────────────────────────────────────────────
export const getExpenses = async (req: AuthRequest, res: Response) => {
  const expenses = await prisma.tripExpense.findMany({
    where: { tripId: req.params.tripId },
    orderBy: { date: 'asc' },
  });
  res.json(expenses);
};

export const addExpense = async (req: AuthRequest, res: Response) => {
  const expense = await prisma.tripExpense.create({
    data: { tripId: req.params.tripId, ...req.body, date: new Date(req.body.date) },
  });
  res.status(201).json(expense);
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  await prisma.tripExpense.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
};

// ── PACKING ───────────────────────────────────────────────
const SMART_PACKING: Record<string, string[]> = {
  beach: ['Sunscreen', 'Swimsuit', 'Flip flops', 'Beach towel', 'Sunglasses'],
  cold: ['Winter jacket', 'Thermal underwear', 'Gloves', 'Scarf', 'Warm boots'],
  tropical: ['Insect repellent', 'Light clothing', 'Rain jacket', 'Sandals'],
  desert: ['Sunscreen SPF 50+', 'Hat', 'Light long sleeves', 'Water bottles'],
  temperate: ['Light jacket', 'Umbrella', 'Layers'],
};

const BASE_PACKING = [
  { label: 'Passport', category: 'documents' },
  { label: 'Travel insurance', category: 'documents' },
  { label: 'Phone charger', category: 'electronics' },
  { label: 'Power bank', category: 'electronics' },
  { label: 'Toothbrush', category: 'toiletries' },
  { label: 'Medications', category: 'misc' },
];

export const getPackingItems = async (req: AuthRequest, res: Response) => {
  const items = await prisma.packingItem.findMany({ where: { tripId: req.params.tripId } });
  res.json(items);
};

export const generatePackingList = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: req.userId },
    include: { stops: { include: { city: true } } },
  });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const weatherCategories = [
    ...new Set(trip.stops.map((s: { city: { weatherCategory: string | null } }) => s.city.weatherCategory).filter(Boolean) as string[]),
  ];

  const smartItems = weatherCategories.flatMap((wc: string) =>
    (SMART_PACKING[wc] || []).map((label: string) => ({ label, category: 'clothing' }))
  );

  const allItems = [...BASE_PACKING, ...smartItems];
  await prisma.packingItem.createMany({
    data: allItems.map((item) => ({ ...item, tripId })),
    skipDuplicates: true,
  });

  const items = await prisma.packingItem.findMany({ where: { tripId } });
  res.json(items);
};

export const addPackingItem = async (req: AuthRequest, res: Response) => {
  const item = await prisma.packingItem.create({
    data: { tripId: req.params.tripId, ...req.body },
  });
  res.status(201).json(item);
};

export const togglePackingItem = async (req: AuthRequest, res: Response) => {
  const item = await prisma.packingItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const updated = await prisma.packingItem.update({
    where: { id: req.params.id },
    data: { isPacked: !item.isPacked },
  });
  res.json(updated);
};

export const deletePackingItem = async (req: AuthRequest, res: Response) => {
  await prisma.packingItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
};

// ── NOTES ─────────────────────────────────────────────────
export const getNotes = async (req: AuthRequest, res: Response) => {
  const { q } = req.query as { q?: string };
  const where: { tripId: string; content?: { contains: string; mode: 'insensitive' } } = { tripId: req.params.tripId };
  if (q) where.content = { contains: q, mode: 'insensitive' };
  const notes = await prisma.tripNote.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(notes);
};

export const addNote = async (req: AuthRequest, res: Response) => {
  const note = await prisma.tripNote.create({
    data: { tripId: req.params.tripId, ...req.body },
  });
  res.status(201).json(note);
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  const note = await prisma.tripNote.update({ where: { id: req.params.id }, data: req.body });
  res.json(note);
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  await prisma.tripNote.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
};

// ── ADMIN ─────────────────────────────────────────────────
export const adminStats = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [totalUsers, totalTrips, tripsThisWeek, topCities] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.trip.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.stop.groupBy({
      by: ['cityId'],
      _count: { cityId: true },
      orderBy: { _count: { cityId: 'desc' } },
      take: 10,
    }),
  ]);

  const cityIds = topCities.map((c: { cityId: string }) => c.cityId);
  const cities = await prisma.city.findMany({ where: { id: { in: cityIds } } });
  const topCitiesWithNames = topCities.map((tc: { cityId: string; _count: { cityId: number } }) => ({
    ...tc,
    city: cities.find((c: { id: string }) => c.id === tc.cityId),
  }));

  res.json({ totalUsers, totalTrips, tripsThisWeek, topCities: topCitiesWithNames });
};

export const adminGetUsers = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { q, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: { id: true, name: true, email: true, createdAt: true, isAdmin: true, _count: { select: { trips: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total });
};

export const adminDeleteTrip = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  await prisma.trip.delete({ where: { id: req.params.id } });
  res.json({ message: 'Trip deleted by admin' });
};
