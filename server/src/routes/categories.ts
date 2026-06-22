import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateCategorySchema, UpdateCategorySchema } from '../schemas/categories.schema';
import * as ctrl from '../controllers/categories.controller';

const router = Router();
router.use(requireAuth);

router.get('/',       ctrl.listCategories);
router.post('/',      validateBody(CreateCategorySchema), ctrl.createCategory);
router.patch('/:id',  validateBody(UpdateCategorySchema), ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

export default router;
