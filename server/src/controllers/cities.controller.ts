import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getCities = async (req: AuthRequest, res: Response) => {
  const { q, continent, costIndex, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { country: { contains: q, mode: 'insensitive' } }];
  if (continent) where.continent = continent;
  if (costIndex) where.costIndex = costIndex;

  const [cities, total] = await Promise.all([
    prisma.city.findMany({ where, skip, take: parseInt(limit), orderBy: { popularityScore: 'desc' } }),
    prisma.city.count({ where }),
  ]);
  res.json({ cities, total });
};

export const getCityById = async (req: AuthRequest, res: Response) => {
  const city = await prisma.city.findUnique({
    where: { id: req.params.id },
    include: { activities: true },
  });
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json(city);
};

export const getTrendingCities = async (_req: AuthRequest, res: Response) => {
  const cities = await prisma.city.findMany({
    orderBy: { popularityScore: 'desc' },
    take: 8,
  });
  res.json(cities);
};

export const getActivities = async (req: AuthRequest, res: Response) => {
  const { cityId, category, maxCost, maxDuration, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (cityId) where.cityId = cityId;
  if (category) where.category = category;
  if (maxCost) where.costEstimate = { lte: parseFloat(maxCost) };
  if (maxDuration) where.durationHours = { lte: parseFloat(maxDuration) };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({ where, skip, take: parseInt(limit), include: { city: true } }),
    prisma.activity.count({ where }),
  ]);
  res.json({ activities, total });
};

// Rule-based AI suggestion engine
export const suggestActivities = async (req: AuthRequest, res: Response) => {
  const { cityId, duration = '3', existingIds = [] } = req.body as {
    cityId: string;
    duration: string;
    existingIds: string[];
  };

  const days = parseInt(duration);
  const categories = days <= 2 ? ['sightseeing', 'food'] : ['sightseeing', 'food', 'adventure', 'culture'];

  const suggestions = await prisma.activity.findMany({
    where: {
      cityId,
      id: { notIn: existingIds },
      category: { in: categories },
    },
    orderBy: { rating: 'desc' },
    take: Math.min(days * 3, 9),
  });
  res.json(suggestions);
};

export const bookmarkCity = async (req: AuthRequest, res: Response) => {
  const { cityId } = req.params;
  const uid = req.userId!;
  const existing = await prisma.bookmarkedCity.findUnique({
    where: { userId_cityId: { userId: uid, cityId } },
  });
  if (existing) {
    await prisma.bookmarkedCity.delete({ where: { userId_cityId: { userId: uid, cityId } } });
    return res.json({ bookmarked: false });
  }
  await prisma.bookmarkedCity.create({ data: { userId: uid, cityId } });
  res.json({ bookmarked: true });
};

export const getBookmarkedCities = async (req: AuthRequest, res: Response) => {
  const bookmarks = await prisma.bookmarkedCity.findMany({
    where: { userId: req.userId },
    include: { city: true },
  });
  res.json(bookmarks.map((b: { city: any }) => b.city));
};
