import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/bills.service';

export async function listBills(req: Request, res: Response, next: NextFunction) {
  try { res.json(await svc.listBills(req.user!.uid)); }
  catch (err) { next(err); }
}

export async function createBill(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await svc.createBill(req.user!.uid, req.body)); }
  catch (err) { next(err); }
}

export async function updateBill(req: Request, res: Response, next: NextFunction) {
  try {
    const bill = await svc.updateBill(req.user!.uid, req.params.id, req.body);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json(bill);
  } catch (err) { next(err); }
}

export async function deleteBill(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await svc.deleteBill(req.user!.uid, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Bill not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}
