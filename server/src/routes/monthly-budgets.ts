import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BulkUpsertMonthlySchema } from '../schemas/monthly-budgets.schema';
import * as ctrl from '../controllers/monthly-budgets.controller';

const router = Router();
router.use(requireAuth);

router.get('/summary',              ctrl.getMonthlySummary);
router.put('/:year/:month',         validateBody(BulkUpsertMonthlySchema), ctrl.bulkUpsertMonthly);
router.post('/:year/:month/copy',   ctrl.copyFromPreviousMonth);

export default router;
