import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateExpenseSchema, UpdateExpenseSchema } from '../schemas/expenses.schema';
import * as ctrl from '../controllers/expenses.controller';

const router = Router();
router.use(requireAuth);

router.get('/',       ctrl.listExpenses);
router.post('/',      validateBody(CreateExpenseSchema), ctrl.createExpense);
router.patch('/:id',  validateBody(UpdateExpenseSchema), ctrl.updateExpense);
router.delete('/:id', ctrl.deleteExpense);

export default router;
