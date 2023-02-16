import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import * as AgentController from './controller';

const router = express.Router();

router.get('/', isUserAuth, AgentController.fetch);
router.post('/', isUserAuth, AgentController.update);

export default router;
