import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const addStop = async (req: AuthRequest, res: Response) => {
  const { tripId } = req.params;
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.userId } });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const count = await prisma.stop.count({ where: { tripId } });
  const stop = await prisma.stop.create({
    data: { tripId, ...req.body, orderIndex: count },
    include: { city: true },
  });
  res.status(201).json(stop);
};

export const updateStop = async (req: AuthRequest, res: Response) => {
  const stop = await prisma.stop.update({
    where: { id: req.params.stopId },
    data: {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    },
    include: { city: true },
  });
  res.json(stop);
};

export const deleteStop = async (req: AuthRequest, res: Response) => {
  await prisma.stop.delete({ where: { id: req.params.stopId } });
  res.json({ message: 'Stop removed' });
};

export const reorderStops = async (req: AuthRequest, res: Response) => {
  const { stops } = req.body as { stops: { id: string; orderIndex: number }[] };
  await Promise.all(
    stops.map((s) => prisma.stop.update({ where: { id: s.id }, data: { orderIndex: s.orderIndex } }))
  );
  res.json({ message: 'Reordered' });
};

export const addActivity = async (req: AuthRequest, res: Response) => {
  const sa = await prisma.stopActivity.create({
    data: { stopId: req.params.stopId, ...req.body },
    include: { activity: true },
  });
  res.status(201).json(sa);
};

export const removeActivity = async (req: AuthRequest, res: Response) => {
  await prisma.stopActivity.delete({ where: { id: req.params.saId } });
  res.json({ message: 'Activity removed' });
};

export const updateStopActivity = async (req: AuthRequest, res: Response) => {
  const sa = await prisma.stopActivity.update({
    where: { id: req.params.saId },
    data: req.body,
    include: { activity: true },
  });
  res.json(sa);
};
