import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { AuthRequest } from '../middleware/auth';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, isAdmin: true },
  });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });

  res
    .cookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
    .cookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 86400000 })
    .json({ user, accessToken });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });

  const { passwordHash: _, ...safeUser } = user;
  res
    .cookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
    .cookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 86400000 })
    .json({ user: safeUser, accessToken });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.userId !== payload.userId) return res.status(401).json({ error: 'Invalid token' });

    await prisma.refreshToken.delete({ where: { token } });
    const newAccess = signAccessToken(payload.userId);
    const newRefresh = signRefreshToken(payload.userId);
    await prisma.refreshToken.create({
      data: { token: newRefresh, userId: payload.userId, expiresAt: new Date(Date.now() + 7 * 86400000) },
    });

    res
      .cookie('access_token', newAccess, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
      .cookie('refresh_token', newRefresh, { ...COOKIE_OPTS, maxAge: 7 * 86400000 })
      .json({ accessToken: newAccess });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (token) await prisma.refreshToken.deleteMany({ where: { token } });
  res.clearCookie('access_token').clearCookie('refresh_token').json({ message: 'Logged out' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true, isAdmin: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, language, avatarUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name, language, avatarUrl },
    select: { id: true, name: true, email: true, avatarUrl: true, language: true },
  });
  res.json(user);
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
  res.json({ message: 'Password updated' });
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  await prisma.user.delete({ where: { id: req.userId } });
  res.clearCookie('access_token').clearCookie('refresh_token').json({ message: 'Account deleted' });
};
