import express from 'express';

import * as LocationController from './controller';

const router = express.Router();

router.get('/', LocationController.fetchAll);

export default router;
