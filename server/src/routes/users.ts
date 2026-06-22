import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { UpsertUserSchema, UpdateUserSchema } from '../schemas/users.schema';
import * as ctrl from '../controllers/users.controller';

const router = Router();
router.use(requireAuth);

router.post('/',       validateBody(UpsertUserSchema), ctrl.upsertUser);
router.get('/me',      ctrl.getMe);
router.patch('/me',    validateBody(UpdateUserSchema), ctrl.updateMe);

export default router;
