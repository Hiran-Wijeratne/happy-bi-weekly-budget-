import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as ctrl from '../controllers/feedback.controller';

const router = Router();

router.post('/contact', ctrl.submitContact); // public — no auth required

router.use(requireAuth);
router.post('/', ctrl.submitFeedback);

export default router;
