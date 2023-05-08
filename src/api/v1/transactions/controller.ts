import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { initOrUpdateAgent } from '../agents/service';
import { updateCredit } from '../credits/service';
import { findPackageById } from '../packages/service';
import { findUserById, updateIsUserAnAgent } from '../users/service';
import { editTransaction, editTransactionStatus, saveTransaction } from './service';
import { transactionSchema, transactionUpdateStatusSchema } from './validation';
import config from '../../../config';
import aesDecrypt from '../../../utils/aesDecrypt';
import { signJwt } from '../../../utils/jwtUtils';
import { moveTempPost, removeTempPostByTrackId } from '../posts/service';
import { saveUserLog } from '../user_logs/service';

const insert = async (req: Request, res: Response, next: NextFunction) => {
  const { payload } = req.body;
  const userId = res.locals.user.payload.id;

  try {
    await transactionSchema.validate(payload);
    const packageObj = await findPackageById(payload.packageId);
    payload.packageObj = packageObj;

    const user = await findUserById(userId);
    payload.user = user;

    await saveTransaction(payload);
    logger.info(`Transaction created by user ${payload.user?.phone}`);
    await saveUserLog([
      {
        post_id: undefined,
        transaction: payload.trackId,
        user: payload.user?.phone ?? undefined,
        activity: 'Transaction created successfully',
      },
    ]);

    return res.status(200).json({ success: 'Transaction  created successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
    }
    logger.error(`Transaction creation failed by user ${payload.user?.phone}`);
    await saveUserLog([
      {
        post_id: undefined,
        transaction: payload.trackId,
        user: payload.user?.phone ?? undefined,
        activity: 'Transaction creation failed',
      },
    ]);
    return next(error);
  }
};

const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { trackId, status } = req.body;

  try {
    await transactionUpdateStatusSchema.validate({ trackId, status });
    const response = await editTransactionStatus(trackId, status);
    if (response.status === 404) throw new ErrorHandler(404, 'Track id not found');
    return res.status(200).json({ success: 'Transaction  updated successfully' });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
    if (error.name === 'ValidationError') {
      error.message = 'Invalid payload passed';
      return next(error);
    }
    return next(error);
  }
};

const handleKpayResponse = async (req: Request, res: Response) => {
  let isOperationSucceeded = false;
  let redirectUrl = `${config.origin}/topup?`;
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
      } else {
        status = 'failed';
        await removeTempPostByTrackId(trackId as string);
      }

      try {
        const response = await editTransaction(
          trackId as unknown as number,
          (referenceId as string).toString(),
          tranId.toString(),
          status,
        );

        logger.info(`Transaction ${response.data?.id} status updated to ${status}`);
        await saveUserLog([
          {
            post_id: undefined,
            transaction: response.data?.track_id,
            user: response?.data?.user?.phone ?? undefined,
            activity: `Transaction ${response.data?.track_id} status updated to ${status}`,
          },
        ]);

        if (status === 'completed' && response.data) {
          let { package_title: packageTitle } = response.data;
          packageTitle = packageTitle.slice(0, -1);

          if (packageTitle === 'stickyDirec') {
            await moveTempPost(trackId as string);
            redirectUrl = `${config.origin}/redirect?`;
          } else {
            await updateCredit(response.data.user.id, packageTitle, parseInt(numOfCredits as string, 10), 'ADD');
            if (packageTitle === 'agent') {
              const { package_title } = response.data;
              const user = await updateIsUserAnAgent(response.data.user.id, true);
              await initOrUpdateAgent(response.data.user, package_title);

              logger.info(`Agent subscription initiated for user ${user.phone}`);
              await saveUserLog([
                {
                  post_id: undefined,
                  transaction: response.data?.track_id,
                  user: user?.phone ?? undefined,
                  activity: `Agent subscription initiated for user ${user.phone}`,
                },
              ]);

              res.clearCookie('token');

              const userPayload = {
                id: user.id,
                phone: user.phone,
                is_agent: user.is_agent,
                status: user.status,
              };
              const token = await signJwt(userPayload);
              // @ts-ignore
              res.cookie('token', token, config.cookieOptions);
              nextOperation = true;
            }
          }
        }
      } catch (error) {
        logger.error(`${error.name}: ${error.message}`);
        logger.error(`Transaction failed for track id: ${trackId}`);
        await saveUserLog([
          {
            post_id: undefined,
            transaction: trackId ?? undefined,
            user: undefined,
            activity: `Transaction failed for tran id: ${trackId}`,
          },
        ]);
      }
    } else {
      status = 'canceled';

      try {
        await editTransactionStatus(trackId, status);
        await removeTempPostByTrackId(trackId as string);
      } catch (error) {
        logger.error(`${error.name}: ${error.message}`);
      }
      logger.error(`Transaction failed for track id: ${trackId}`);
      await saveUserLog([
        {
          post_id: undefined,
          transaction: trackId ?? undefined,
          user: undefined,
          activity: `Transaction failed for track id: ${trackId}`,
        },
      ]);
    }
  }
  const message = `success=${!!isOperationSucceeded}`;
  return res.redirect(301, `${redirectUrl}${message}${nextOperation ? '&redirect=true' : ''}`);
};

const handleKpayError = async (req: Request, res: Response) => {
  const trackId = req.query.trackid;
  const redirectUrl = `${config.origin}/topup?`;

  try {
    await editTransactionStatus(trackId as string, 'failed');
    await removeTempPostByTrackId(trackId as string);
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
  }
  logger.error(`Transaction failed for track id: ${trackId}`);
  await saveUserLog([
    {
      post_id: undefined,
      transaction: trackId ? (trackId as string) : undefined,
      user: undefined,
      activity: `Transaction failed for track id: ${trackId}`,
    },
  ]);
  return res.redirect(301, `${redirectUrl}success=false`);
};

export { insert, updateStatus, handleKpayResponse, handleKpayError };
