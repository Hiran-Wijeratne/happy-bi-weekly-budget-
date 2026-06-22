import { Request, Response, NextFunction } from 'express';
import { getDashboardData } from '../services/dashboard.service';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    res.json(await getDashboardData(req.user!.uid, year));
  } catch (err) { next(err); }
}
