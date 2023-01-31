import express from 'express';

import * as TransactionController from './controller';

const router = express.Router();

router.get('/test', TransactionController.test);

export default router;
