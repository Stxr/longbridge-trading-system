import { Router } from 'express';
import strategyRouter from './strategies';
import backtestRouter from './backtest';

const router = Router();

router.use('/strategies', strategyRouter);
router.use('/backtest', backtestRouter);

export default router;
