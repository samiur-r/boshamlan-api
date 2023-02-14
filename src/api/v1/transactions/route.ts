import express from 'express';

import { isUserAuth, isRequestAuth } from '../../../middlewares/AuthMiddleware';

import * as TransactionController from './controller';

const router = express.Router();

router.post('/', isUserAuth, TransactionController.insert);
router.put('/', isRequestAuth, TransactionController.update);
router.put('/update-status', isRequestAuth, TransactionController.updateStatus);
router.post('/response', TransactionController.handleKpayResponse);

export default router;
