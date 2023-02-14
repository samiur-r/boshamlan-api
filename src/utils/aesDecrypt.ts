import * as crypto from 'crypto';

import config from '../config';

const key = config.knetTermResourceKey;

const aesDecrypt = (text: string) => {
  const AES_METHOD = 'aes-128-cbc';
  const decipher = crypto.createDecipheriv(AES_METHOD, Buffer.from(key as string), key as string);
  const encryptedText = Buffer.from(text, 'hex');
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

export default aesDecrypt;
