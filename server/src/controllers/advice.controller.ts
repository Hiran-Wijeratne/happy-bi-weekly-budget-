import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/advice.service';

export async function getAdvice(req: Request, res: Response, next: NextFunction) {
  try {
    const monthly = Number(req.query.monthly_income);
    if (isNaN(monthly) || monthly < 0) {
      return res.status(400).json({ error: 'monthly_income query param required (number >= 0)' });
    }
    const advice = await svc.getAdviceForIncome(monthly);
    if (!advice) return res.status(404).json({ error: 'No advice found for this income' });
    res.json(advice);
  } catch (err) { next(err); }
}
