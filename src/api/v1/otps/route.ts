import express from 'express';

import * as OtpController from './controller';

const router = express.Router();

router.post('/verify', OtpController.verifyOtp);
router.post('/resend', OtpController.resendOtp);

export default router;
