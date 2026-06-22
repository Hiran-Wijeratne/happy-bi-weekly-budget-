import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateSavingsGoalSchema, UpdateSavingsGoalSchema, CreateContributionSchema } from '../schemas/savings.schema';
import * as ctrl from '../controllers/savings.controller';

const router = Router();
router.use(requireAuth);

router.get('/',                     ctrl.listGoals);
router.post('/',                    validateBody(CreateSavingsGoalSchema), ctrl.createGoal);
router.patch('/:id',                validateBody(UpdateSavingsGoalSchema), ctrl.updateGoal);
router.delete('/:id',               ctrl.deleteGoal);
router.post('/:id/contributions',   validateBody(CreateContributionSchema), ctrl.createContribution);

export default router;
