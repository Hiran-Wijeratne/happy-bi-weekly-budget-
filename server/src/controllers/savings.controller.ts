import { Request, Response, NextFunction } from 'express';
import * as savingsService from '../services/savings.service';

export async function listGoals(req: Request, res: Response, next: NextFunction) {
  try { res.json(await savingsService.listGoals(req.user!.uid)); }
  catch (err) { next(err); }
}

export async function createGoal(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await savingsService.createGoal(req.user!.uid, req.body));
  } catch (err) { next(err); }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await savingsService.updateGoal(req.user!.uid, req.params.id, req.body);
    if (!goal) return res.status(404).json({ error: 'Savings goal not found' });
    res.json(goal);
  } catch (err) { next(err); }
}

export async function deleteGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await savingsService.deleteGoal(req.user!.uid, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Savings goal not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function createContribution(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await savingsService.createContribution(req.user!.uid, req.params.id, req.body));
  } catch (err) { next(err); }
}
