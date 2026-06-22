import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateDebtSchema, UpdateDebtSchema, CreatePaymentSchema } from '../schemas/debts.schema';
import * as ctrl from '../controllers/debts.controller';

const router = Router();
router.use(requireAuth);

router.get('/',                 ctrl.listDebts);
router.post('/',                validateBody(CreateDebtSchema), ctrl.createDebt);
router.patch('/:id',            validateBody(UpdateDebtSchema), ctrl.updateDebt);
router.delete('/:id',           ctrl.deleteDebt);
router.get('/:id/payments',     ctrl.listPayments);
router.post('/:id/payments',    validateBody(CreatePaymentSchema), ctrl.createPayment);

export default router;
