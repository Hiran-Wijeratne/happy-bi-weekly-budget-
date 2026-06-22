import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateSinkingFundSchema, CreateSinkingContributionSchema } from '../schemas/sinking-funds.schema';
import * as ctrl from '../controllers/sinking-funds.controller';

const router = Router();
router.use(requireAuth);

router.get('/',                     ctrl.listFunds);
router.post('/',                    validateBody(CreateSinkingFundSchema), ctrl.createFund);
router.delete('/:id',               ctrl.deleteFund);
router.post('/:id/contributions',   validateBody(CreateSinkingContributionSchema), ctrl.createContribution);

export default router;
