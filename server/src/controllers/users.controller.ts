import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';

export async function upsertUser(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.user!.uid;
    const { email, display_name } = req.body;
    const user = await usersService.upsertUser(uid, email, display_name);
    res.status(200).json(user);
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUser(req.user!.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUser(req.user!.uid, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
}
