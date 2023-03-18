import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import stream, { Readable } from 'stream';

import logger from './logger';

const optimizeImage = async (inputBase64: string): Promise<string> => {
  try {
    // Convert the Base64 string to a Buffer
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const inputBuffer = Buffer.from(inputBase64.split(';base64,').pop()!, 'base64');

    // Use Sharp to get the image's metadata
    const metadata = await sharp(inputBuffer).metadata();

    // If the image is smaller than 800 pixels, don't resize it
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const resizeWidth = Math.min(width, 800);
    const resizeHeight = Math.ceil(height * (resizeWidth / width));

    // Use Sharp to optimize the image
    const outputBuffer = await sharp(inputBuffer)
      .resize(resizeWidth, resizeHeight) // resize the image to 800 pixels wide
      .jpeg({ quality: 80 }) // compress the image to 80% quality JPEG
      .toBuffer();

    // Base64 string of the optimized image
    const outputBase64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
    return outputBase64;
  } catch (err) {
    logger.error(err);
    return inputBase64;
  }
};

export { optimizeImage };
