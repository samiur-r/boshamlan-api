import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import stream, { Readable } from 'stream';

import logger from './logger';

const optimizeImage = async (inputBase64: string): Promise<string> => {
  try {
    // Convert the Base64 string to a Buffer
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const inputBuffer = Buffer.from(inputBase64.split(';base64,').pop()!, 'base64');

    // Use Sharp to optimize the image
    const outputBuffer = await sharp(inputBuffer)
      .resize(800) // resize the image to 800 pixels wide
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

const optimizeVideo = async (base64String: string): Promise<string> => {
  try {
    // Decode base64 string to binary buffer
    const binaryBuffer = Buffer.from(base64String, 'base64');

    // Create FFmpeg command and set output options
    const inputStream = Readable.from(binaryBuffer);
    const outputOptions = ['-vcodec', 'libx264', '-crf', '23', '-preset', 'veryslow'];

    const stdout = await new Promise<Buffer>((resolve, reject) => {
      const ffmpegCommand = ffmpeg(inputStream)
        .outputOptions(outputOptions)
        .toFormat('mp4')
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          logger.info('Video optimization complete!');
        });

      const writableStream = new stream.Writable({
        write(chunk, encoding, callback) {
          resolve(chunk);
          callback();
        },
      });

      ffmpegCommand.pipe(writableStream);
    });

    // Convert optimized video buffer back to base64
    const optimizedBase64 = stdout.toString('base64');

    return optimizedBase64;
  } catch (err) {
    logger.error(err);
    return base64String;
  }
};

export { optimizeImage, optimizeVideo };
