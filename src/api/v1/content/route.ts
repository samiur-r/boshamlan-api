import express from 'express';
import * as ContentController from './controller';

const router = express.Router();

router.post('/', ContentController.fetch);

export default router;
