import * as jose from 'jose';

import config from '../config';

const signJwt = async (user: { id: number; phone: string; is_admin: boolean; is_agent: boolean; status: string }) => {
  const secret = new TextEncoder().encode(config.jwtSecret);
  const alg = 'HS256';

  const jwt = await new jose.SignJWT(user)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('728d')
    .sign(secret);

  return jwt;
};

const signJwtWithPhone = async (phone: string | null) => {
  const secret = new TextEncoder().encode(config.jwtSecret);
  const alg = 'HS256';

  const jwt = await new jose.SignJWT({ phone })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  return jwt;
};

const verifyJwt = async (token: string) => {
  const secret = new TextEncoder().encode(config.jwtSecret);
  const response = await jose.jwtVerify(token, secret);
  return response;
};

export { signJwt, verifyJwt, signJwtWithPhone };
