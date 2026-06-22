import { Request, Response, NextFunction } from 'express';
import * as debtsService from '../services/debts.service';

export async function listDebts(req: Request, res: Response, next: NextFunction) {
  try { res.json(await debtsService.listDebts(req.user!.uid)); }
  catch (err) { next(err); }
}

export async function createDebt(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await debtsService.createDebt(req.user!.uid, req.body));
  } catch (err) { next(err); }
}

export async function updateDebt(req: Request, res: Response, next: NextFunction) {
  try {
    const debt = await debtsService.updateDebt(req.user!.uid, req.params.id, req.body);
    if (!debt) return res.status(404).json({ error: 'Debt not found' });
    res.json(debt);
  } catch (err) { next(err); }
}

export async function deleteDebt(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await debtsService.deleteDebt(req.user!.uid, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Debt not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try { res.json(await debtsService.listPayments(req.user!.uid, req.params.id)); }
  catch (err) { next(err); }
}

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await debtsService.createPayment(req.user!.uid, req.params.id, req.body));
  } catch (err) { next(err); }
}
