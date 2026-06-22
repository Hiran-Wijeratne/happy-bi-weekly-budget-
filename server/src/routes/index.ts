import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboard.controller';
import usersRouter        from './users';
import periodsRouter      from './periods';
import categoriesRouter   from './categories';
import allocationsRouter  from './allocations';
import expensesRouter     from './expenses';
import debtsRouter        from './debts';
import savingsRouter      from './savings';
import sinkingFundsRouter  from './sinking-funds';
import billsRouter          from './bills';
import monthlyBudgetsRouter from './monthly-budgets';
import adviceRouter         from './advice';
import feedbackRouter       from './feedback';

const router = Router();

router.use('/users',          usersRouter);
router.use('/periods',        periodsRouter);
router.use('/categories',     categoriesRouter);
router.use('/allocations',    allocationsRouter);
router.use('/expenses',       expensesRouter);
router.use('/debts',          debtsRouter);
router.use('/savings',        savingsRouter);
router.use('/sinking-funds',    sinkingFundsRouter);
router.use('/bills',            billsRouter);
router.use('/monthly-budgets',  monthlyBudgetsRouter);
router.use('/advice',           adviceRouter);
router.use('/feedback',         feedbackRouter);
router.get('/dashboard',        requireAuth, getDashboard);

export { router };
