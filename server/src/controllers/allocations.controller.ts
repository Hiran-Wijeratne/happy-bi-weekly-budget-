import { Request, Response, NextFunction } from 'express';
import * as allocationsService from '../services/allocations.service';

export async function getAllocations(req: Request, res: Response, next: NextFunction) {
  try {
    const { period_id } = req.query;
    if (!period_id) return res.status(400).json({ error: 'period_id query param required' });
    res.json(await allocationsService.getAllocations(req.user!.uid, period_id as string));
  } catch (err) { next(err); }
}

export async function bulkUpsertAllocations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await allocationsService.bulkUpsertAllocations(
      req.user!.uid,
      req.params.id,
      req.body.allocations
    );
    res.json(result);
  } catch (err) { next(err); }
}

export async function applyRollover(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await allocationsService.applyRollover(req.user!.uid, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}
