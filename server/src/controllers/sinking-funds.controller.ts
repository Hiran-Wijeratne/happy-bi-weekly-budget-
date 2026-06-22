import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/sinking-funds.service';

export async function listFunds(req: Request, res: Response, next: NextFunction) {
  try { res.json(await svc.listFunds(req.user!.uid)); }
  catch (err) { next(err); }
}

export async function createFund(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await svc.createFund(req.user!.uid, req.body)); }
  catch (err) { next(err); }
}

export async function deleteFund(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await svc.deleteFund(req.user!.uid, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Sinking fund not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function createContribution(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await svc.createContribution(req.user!.uid, req.params.id, req.body)); }
  catch (err) { next(err); }
}
