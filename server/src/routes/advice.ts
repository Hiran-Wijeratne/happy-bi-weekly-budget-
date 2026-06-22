import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/advice.controller';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.getAdvice);

export default router;
