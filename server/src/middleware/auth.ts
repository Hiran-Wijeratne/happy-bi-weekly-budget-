import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }
  const token = header.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email ?? '' };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
