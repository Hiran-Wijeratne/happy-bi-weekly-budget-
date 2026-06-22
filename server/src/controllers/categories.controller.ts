import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categories.service';

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await categoriesService.listCategories(req.user!.uid));
  } catch (err) { next(err); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await categoriesService.createCategory(req.user!.uid, req.body);
    res.status(201).json(cat);
  } catch (err) { next(err); }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await categoriesService.updateCategory(req.user!.uid, req.params.id, req.body);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (err) { next(err); }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await categoriesService.deleteCategory(req.user!.uid, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Category not found or is a default category' });
    res.status(204).send();
  } catch (err) { next(err); }
}
