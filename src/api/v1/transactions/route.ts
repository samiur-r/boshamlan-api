import express from 'express';

import * as TransactionController from './controller';

const router = express.Router();

router.post('/test', TransactionController.test);

export default router;
