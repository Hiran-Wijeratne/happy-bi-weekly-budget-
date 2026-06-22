import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { BulkUpsertAllocationsSchema } from '../schemas/allocations.schema';
import * as ctrl from '../controllers/allocations.controller';

const router = Router();
router.use(requireAuth);

router.get('/',                      ctrl.getAllocations);
router.put('/period/:id',            validateBody(BulkUpsertAllocationsSchema), ctrl.bulkUpsertAllocations);
router.post('/period/:id/rollover',  ctrl.applyRollover);

export default router;
