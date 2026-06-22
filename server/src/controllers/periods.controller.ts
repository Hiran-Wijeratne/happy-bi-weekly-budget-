import { Request, Response, NextFunction } from 'express';
import * as periodsService from '../services/periods.service';

export async function generatePeriods(req: Request, res: Response, next: NextFunction) {
  try {
    const { year, pay_start_date } = req.body;
    const periods = await periodsService.generateAndSavePeriods(req.user!.uid, year, pay_start_date);
    res.status(201).json(periods);
  } catch (err) { next(err); }
}

export async function listPeriods(req: Request, res: Response, next: NextFunction) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const periods = await periodsService.listPeriods(req.user!.uid, year);
    res.json(periods);
  } catch (err) { next(err); }
}

export async function getPeriod(req: Request, res: Response, next: NextFunction) {
  try {
    const period = await periodsService.getPeriod(req.user!.uid, req.params.id);
    if (!period) return res.status(404).json({ error: 'Period not found' });
    res.json(period);
  } catch (err) { next(err); }
}

export async function updatePeriod(req: Request, res: Response, next: NextFunction) {
  try {
    const period = await periodsService.updatePeriod(req.user!.uid, req.params.id, req.body);
    if (!period) return res.status(404).json({ error: 'Period not found' });
    res.json(period);
  } catch (err) { next(err); }
}
