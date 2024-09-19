import makeDebug from 'debug';
import {
  ensureObjPropsValid,
  getLongToken,
  getShortToken,
  getUserData,
  notify
} from '../helpers';
import type { Id, Params } from '@feathersjs/feathers';

import type {
  IdentifyUser,
  ResendVerifySignupOptions,
  SanitizedUser,
  NotifierOptions,
  User
} from '../types';

const debug = makeDebug('authLocalMgnt:resendVerifySignup');

// {email}, {cellphone}, {verifyToken}, {verifyShortToken},
// {email, cellphone, verifyToken, verifyShortToken}
export default async function resendVerifySignup (
  options: ResendVerifySignupOptions,
  identifyUser: IdentifyUser,
  notifierOptions?: NotifierOptions,
  params?: Params
): Promise<SanitizedUser> {
  debug('identifyUser=', identifyUser);

  if (params && "query" in params) {
    params = Object.assign({}, params);
    delete params.query;
  }

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
  const usersServiceId = usersService.id!;

  ensureObjPropsValid(identifyUser,
    identifyUserProps.concat('verifyToken', 'verifyShortToken')
  );

  const users = await usersService.find({
    ...params,
    query: { ...identifyUser, $limit: 2 },
    paginate: false,
  }) as User[];
  const user = getUserData(users, ['isNotVerified']);

  const [verifyToken, verifyShortToken] = await Promise.all([
    getLongToken(longTokenLen),
    getShortToken(shortTokenLen, shortTokenDigits)
  ]);

  const patchedUser = await usersService.patch(user[usersServiceId] as Id, {
    isVerified: false,
    verifyExpires: Date.now() + delay,
    verifyToken,
    verifyShortToken
  }, Object.assign({}, params)) as User;

  const userResult = await notify(notifier, 'resendVerifySignup', patchedUser, notifierOptions);
  return sanitizeUserForClient(userResult);
}
