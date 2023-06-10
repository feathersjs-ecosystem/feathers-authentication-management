import makeDebug from 'debug';

import {
  concatIDAndHash,
  ensureObjPropsValid,
  getLongToken,
  getShortToken,
  getUserData,
  hashPassword,
  notify,
  isDateAfterNow
} from '../helpers';

import type { Id, Params } from '@feathersjs/feathers';
import type {
  IdentifyUser,
  SanitizedUser,
  SendResetPwdOptions,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:sendResetPwd');

export default async function sendResetPwd (
  options: SendResetPwdOptions,
  identifyUser: IdentifyUser,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  debug('sendResetPwd');

  if (params && "query" in params) {
    params = Object.assign({}, params);
    delete params.query;
  }

  const {
    app,
    identifyUserProps,
    longTokenLen,
    passwordField,
    resetAttempts,
    resetDelay,
    reuseResetToken,
    sanitizeUserForClient,
    service,
    shortTokenDigits,
    shortTokenLen,
    skipIsVerifiedCheck,
    notifier
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  ensureObjPropsValid(identifyUser, identifyUserProps);

  const users = await usersService.find({
    ...params,
    query: { ...identifyUser, $limit: 2 },
    paginate: false,
  });
  const user = getUserData(users, skipIsVerifiedCheck ? [] : ['isVerified']);

  if (
    // Use existing token when it's not hashed,
    // and remaining time exceeds half of resetDelay
    reuseResetToken && user.resetToken && user.resetToken.includes('___') &&
    isDateAfterNow(user.resetExpires, resetDelay / 2)
  ) {
    await notify(notifier, 'sendResetPwd', user, notifierOptions);
    return sanitizeUserForClient(user);
  }

  const [resetToken, resetShortToken] = await Promise.all([
    getLongToken(longTokenLen),
    getShortToken(shortTokenLen, shortTokenDigits)
  ]);

  Object.assign(user, {
    resetExpires: Date.now() + resetDelay,
    resetAttempts: resetAttempts,
    resetToken: concatIDAndHash(user[usersServiceId] as Id, resetToken),
    resetShortToken: resetShortToken
  });

  await notify(options.notifier, 'sendResetPwd', user, notifierOptions);

  const [resetToken3, resetShortToken3] = await Promise.all([
    reuseResetToken ? user.resetToken : hashPassword(app, user.resetToken, passwordField),
    reuseResetToken ? user.resetShortToken : hashPassword(app, user.resetShortToken, passwordField)
  ]);

  const patchedUser = await usersService.patch(user[usersServiceId] as Id, {
    resetExpires: user.resetExpires,
    resetAttempts: user.resetAttempts,
    resetToken: resetToken3,
    resetShortToken: resetShortToken3
  }, Object.assign({}, params));

  return sanitizeUserForClient(patchedUser);
}
