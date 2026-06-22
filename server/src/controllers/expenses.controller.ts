import { Request, Response, NextFunction } from 'express';
import * as expensesService from '../services/expenses.service';

export async function listExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const { period_id, year } = req.query;
    if (year) {
      res.json(await expensesService.listExpensesByYear(req.user!.uid, Number(year)));
      return;
    }
    if (!period_id) return res.status(400).json({ error: 'period_id or year query param required' });
    res.json(await expensesService.listExpenses(req.user!.uid, period_id as string));
  } catch (err) { next(err); }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await expensesService.createExpense(req.user!.uid, req.body);
    res.status(201).json(expense);
  } catch (err) { next(err); }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await expensesService.updateExpense(req.user!.uid, req.params.id, req.body);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) { next(err); }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await expensesService.deleteExpense(req.user!.uid, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Expense not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}
