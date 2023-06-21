import * as fs from 'fs';
import logger from './logger';

export const deleteFile = (filePath: string) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      logger.error(err);
      return;
    }
    logger.info(`${filePath} was deleted`);
  });
};
