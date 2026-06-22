import { Request, Response, NextFunction } from 'express';
import * as feedbackService from '../services/feedback.service';

export async function submitFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const row = await feedbackService.submitFeedback(req.user!.uid, req.body);
    res.status(201).json(row);
  } catch (err) { next(err); }
}

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, type = 'contact', message, rating } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }
    const row = await feedbackService.submitContact({ name, email, type, message, rating });
    res.status(201).json(row);
  } catch (err) { next(err); }
}
