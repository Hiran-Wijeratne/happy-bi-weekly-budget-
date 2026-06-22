import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/monthly-budgets.service';

function parseYearMonth(req: Request): { year: number; month: number } | null {
  const year  = Number(req.query.year  ?? req.params.year);
  const month = Number(req.query.month ?? req.params.month);
  if (!year || !month || month < 1 || month > 12) return null;
  return { year, month };
}

export async function getMonthlySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const ym = parseYearMonth(req);
    if (!ym) return res.status(400).json({ error: 'year and month (1–12) query params required' });
    res.json(await svc.getMonthlySummary(req.user!.uid, ym.year, ym.month));
  } catch (err) { next(err); }
}

export async function bulkUpsertMonthly(req: Request, res: Response, next: NextFunction) {
  try {
    const ym = parseYearMonth(req);
    if (!ym) return res.status(400).json({ error: 'year and month params required' });
    res.json(await svc.bulkUpsertMonthly(req.user!.uid, ym.year, ym.month, req.body.allocations));
  } catch (err) { next(err); }
}

export async function copyFromPreviousMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const ym = parseYearMonth(req);
    if (!ym) return res.status(400).json({ error: 'year and month params required' });
    const result = await svc.copyFromPreviousMonth(req.user!.uid, ym.year, ym.month);
    res.json(result);
  } catch (err) { next(err); }
}
