import express from 'express';
import * as UserController from './controller';

const router = express.Router();

router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/login', UserController.login);

export default router;
