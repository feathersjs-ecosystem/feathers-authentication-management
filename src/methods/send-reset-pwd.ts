import makeDebug from 'debug';
import concatIDAndHash from '../helpers/concat-id-and-hash';
import ensureObjPropsValid from '../helpers/ensure-obj-props-valid';
import getLongToken from '../helpers/get-long-token';
import getShortToken from '../helpers/get-short-token';
import getUserData from '../helpers/get-user-data';
import hashPassword from '../helpers/hash-password';
import notifier from '../helpers/notifier';
import isDateAfterNow from '../helpers/is-date-after-now';

import type { Id } from '@feathersjs/feathers';
import type {
  IdentifyUser,
  SanitizedUser,
  SendResetPwdOptions,
  UsersArrayOrPaginated,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:sendResetPwd');

export default async function sendResetPwd (
  options: SendResetPwdOptions,
  identifyUser: IdentifyUser,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  debug('sendResetPwd');

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
    skipIsVerifiedCheck
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  ensureObjPropsValid(identifyUser, identifyUserProps);

  const users: UsersArrayOrPaginated = await usersService.find({ query: Object.assign({ $limit: 2 }, identifyUser ) });
  const user1 = getUserData(users, skipIsVerifiedCheck ? [] : ['isVerified']);

  if (
    // Use existing token when it's not hashed,
    reuseResetToken && user1.resetToken && user1.resetToken.includes('___') &&
    // and remaining time exceeds half of resetDelay
    isDateAfterNow(user1.resetExpires, resetDelay / 2)
  ) {
    await notifier(options.notifier, 'sendResetPwd', user1, notifierOptions);
    return sanitizeUserForClient(user1);
  }

  const [ resetToken, resetShortToken ] = await Promise.all([
    getLongToken(longTokenLen),
    getShortToken(shortTokenLen, shortTokenDigits)
  ])

  const user2 = Object.assign(user1, {
    resetExpires: Date.now() + resetDelay,
    resetAttempts: resetAttempts,
    resetToken: concatIDAndHash(user1[usersServiceId] as Id, resetToken),
    resetShortToken: resetShortToken
  });

  await notifier(options.notifier, 'sendResetPwd', user2, notifierOptions);

  const [ resetToken3, resetShortToken3 ] = await Promise.all([
    reuseResetToken ? user2.resetToken : hashPassword(app, user2.resetToken, passwordField),
    reuseResetToken ? user2.resetShortToken : hashPassword(app, user2.resetShortToken, passwordField)
  ])

  const user3 = await usersService.patch(user2[usersServiceId], {
    resetExpires: user2.resetExpires,
    resetAttempts: user2.resetAttempts,
    resetToken: resetToken3,
    resetShortToken: resetShortToken3
  });

  return sanitizeUserForClient(user3);
}
