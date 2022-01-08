import makeDebug from 'debug';
import {
  ensureObjPropsValid,
  getLongToken,
  getShortToken,
  getUserData,
  notify
} from '../helpers';

import type {
  IdentifyUser,
  ResendVerifySignupOptions,
  SanitizedUser,
  UsersArrayOrPaginated,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:resendVerifySignup');

// {email}, {cellphone}, {verifyToken}, {verifyShortToken},
// {email, cellphone, verifyToken, verifyShortToken}
export default async function resendVerifySignup (
  options: ResendVerifySignupOptions,
  identifyUser: IdentifyUser,
  notifierOptions: NotifierOptions
): Promise<SanitizedUser> {
  debug('identifyUser=', identifyUser);
  const {
    app,
    service,
    delay,
    identifyUserProps,
    longTokenLen,
    sanitizeUserForClient,
    shortTokenDigits,
    shortTokenLen,
    notifier
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  ensureObjPropsValid(identifyUser,
    identifyUserProps.concat('verifyToken', 'verifyShortToken')
  );

  const users: UsersArrayOrPaginated = await usersService.find({ query: Object.assign({ $limit: 2 }, identifyUser) });
  const user1 = getUserData(users, ['isNotVerified']);

  const [verifyToken, verifyShortToken] = await Promise.all([
    getLongToken(longTokenLen),
    getShortToken(shortTokenLen, shortTokenDigits)
  ]);

  const user2 = await usersService.patch(user1[usersServiceId], {
    isVerified: false,
    verifyExpires: Date.now() + delay,
    verifyToken,
    verifyShortToken
  });

  const user3 = await notify(notifier, 'resendVerifySignup', user2, notifierOptions);
  return sanitizeUserForClient(user3);
}
