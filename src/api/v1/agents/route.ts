import express from 'express';

import { isUserAuth } from '../../../middlewares/AuthMiddleware';
import upload from '../../../middlewares/FileUploadMiddleware';
import * as AgentController from './controller';

const router = express.Router();

router.get('/', isUserAuth, AgentController.fetch);
router.post('/', [isUserAuth, upload.any()], AgentController.update);

export default router;