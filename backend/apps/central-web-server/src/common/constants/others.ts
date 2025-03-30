import { IS_DEV } from 'libs/constants/src/envs';

export const setCookieOptions = {
  secure: !IS_DEV,
  httpOnly: true,
  sameSite: false,
  path: '/',
};
