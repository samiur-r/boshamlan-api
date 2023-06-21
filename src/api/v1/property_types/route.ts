import express from 'express';

import * as PropertyTypeController from './controller';

const router = express.Router();

router.get('/:category_id', PropertyTypeController.sortPropertyTypes);

export default router;
