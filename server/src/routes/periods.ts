import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { GeneratePeriodsSchema, UpdatePeriodSchema } from '../schemas/periods.schema';
import * as ctrl from '../controllers/periods.controller';

const router = Router();
router.use(requireAuth);

router.get('/',              ctrl.listPeriods);
router.post('/generate',     validateBody(GeneratePeriodsSchema), ctrl.generatePeriods);
router.get('/:id',           ctrl.getPeriod);
router.patch('/:id',         validateBody(UpdatePeriodSchema), ctrl.updatePeriod);

export default router;
