import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { initOrUpdateAgent } from '../agents/service';
import { updateCredit } from '../credits/service';
import { findPackageById } from '../packages/service';
import { updateIsUserAnAgent } from '../users/service';
import { editTransaction, editTransactionStatus, saveTransaction } from './service';
import { transactionSchema, transactionUpdateStatusSchema } from './validation';
import config from '../../../config';
import aesDecrypt from '../../../utils/aesDecrypt';
import { signJwt } from '../../../utils/jwtUtils';

const insert = async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = req.body;
  payload.user = res.locals.user.payload;

  try {
    await transactionSchema.validate(payload);
    const packageObj = await findPackageById(payload.packageId);
    payload.packageObj = packageObj;
    await saveTransaction(payload);
    return res.status(200).json({ success: 'تم إنشاء المعاملة بنجاح' }); // Transaction  created successfully
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'مرت حمولة غير صالحة'; // Invalid payload passed
      return next(error);
    }
    return next(error);
  }
};

// const update = async (req: Request, res: Response, next: NextFunction) => {
//   const { trackId, referenceId, tranId, status, numOfCredits } = req.body;

//   try {
//     let nextOperation = false;
//     let user;
//     await transactionUpdateSchema.validate({ trackId, referenceId, tranId, status });
//     const response = await editTransaction(trackId, referenceId.toString(), tranId.toString(), status);
//     if (response.status === 404) throw new ErrorHandler(404, 'معرف المسار غير موجود'); // Track id not found
//     if (status === 'completed' && response.data) {
//       let { package_title: packageTitle } = response.data;
//       packageTitle = packageTitle.slice(0, -1);
//       await updateCredit(response.data.user.id, packageTitle, parseInt(numOfCredits, 10));
//       if (packageTitle === 'agent') {
//         await updateIsUserAnAgent(response.data.user.id, true);
//         await initOrUpdateAgent(response.data.user);
//         nextOperation = true;
//         user = response.data.user;
//       }
//     }
//     return res.status(200).json({ success: 'Your payment was successfully processed', nextOperation, user });
//   } catch (error) {
//     logger.error(`${error.name}: ${error.message}`);
//     if (error.name === 'ValidationError') {
//       error.message = 'مرت حمولة غير صالحة'; // Invalid payload passed
//       return next(error);
//     }
//     return next(error);
//   }
// };

const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { trackId, status } = req.body;

  try {
    await transactionUpdateStatusSchema.validate({ trackId, status });
    const response = await editTransactionStatus(trackId, status);
    if (response.status === 404) throw new ErrorHandler(404, 'معرف المسار غير موجود'); // Track id not found
    return res.status(200).json({ success: 'تم تحديث المعاملة بنجاح' }); // Transaction  updated successfully
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'مرت حمولة غير صالحة'; // Invalid payload passed
      return next(error);
    }
    return next(error);
  }
};

const handleKpayResponse = async (req: Request, res: Response) => {
  let isOperationSucceeded = false;
  const redirectUrl = `${config.origin}/topup?`;
  let nextOperation = false;

  if (req.body?.trandata) {
    const decryptedText = aesDecrypt(req.body.trandata);
    const urlParams = new URLSearchParams(decryptedText);
    const trackId = urlParams.get('trackid');
    const referenceId = urlParams.get('ref');
    const tranId = urlParams.get('tranid');
    const result = urlParams.get('result');
    const numOfCredits = urlParams.get('udf1');
    let status;

    if (tranId) {
      if (result === 'CAPTURED') {
        status = 'completed';
        isOperationSucceeded = true;
      } else status = 'failed';

      try {
        const response = await editTransaction(
          trackId as unknown as number,
          (referenceId as string).toString(),
          tranId.toString(),
          status,
        );

        if (status === 'completed' && response.data) {
          let { package_title: packageTitle } = response.data;
          packageTitle = packageTitle.slice(0, -1);
          await updateCredit(response.data.user.id, packageTitle, parseInt(numOfCredits as string, 10), 'ADD');
          if (packageTitle === 'agent') {
            const user = await updateIsUserAnAgent(response.data.user.id, true);
            await initOrUpdateAgent(response.data.user);

            res.clearCookie('token');

            const userPayload = {
              id: user.id,
              phone: user.phone,
              is_admin: user.is_admin,
              is_agent: user.is_agent,
              status: user.status,
            };
            const token = await signJwt(userPayload);
            // @ts-ignore
            res.cookie('token', token, config.cookieOptions);
            nextOperation = true;
          }
        }
      } catch (error) {
        logger.error(error);
      }
    } else {
      status = 'canceled';

      try {
        await editTransactionStatus(trackId, status);
      } catch (error) {
        logger.error(`${error.name}: ${error.message}`);
      }
    }
  }
  const message = `success=${!!isOperationSucceeded}`;
  return res.redirect(301, `${redirectUrl}${message}${nextOperation ? '&redirect=true' : ''}`);
};

export { insert, updateStatus, handleKpayResponse };
