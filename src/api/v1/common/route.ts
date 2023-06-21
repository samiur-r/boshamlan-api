import express from 'express';
import * as CommonController from './controller';

const router = express.Router();

router.post('/notify-slack', CommonController.notifySlack);

export default router;
