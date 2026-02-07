import { Router } from 'express';
import { StrategyLoader } from '../../cli/strategy-loader';

const router = Router();

router.get('/', (req, res) => {
  try {
    const strategies = StrategyLoader.listStrategies();
    res.json(strategies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
