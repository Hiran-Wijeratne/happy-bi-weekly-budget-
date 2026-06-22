import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { CreateBillSchema, UpdateBillSchema } from '../schemas/bills.schema';
import * as ctrl from '../controllers/bills.controller';

const router = Router();
router.use(requireAuth);

router.get('/',       ctrl.listBills);
router.post('/',      validateBody(CreateBillSchema), ctrl.createBill);
router.patch('/:id',  validateBody(UpdateBillSchema), ctrl.updateBill);
router.delete('/:id', ctrl.deleteBill);

export default router;
