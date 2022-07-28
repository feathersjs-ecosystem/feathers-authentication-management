
import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import {
  comparePasswords,
  ensureObjPropsValid,
  getLongToken,
  getShortToken,
  getUserData,
  notify
} from '../helpers';
import type { Params } from '@feathersjs/feathers';

import type {
  IdentifyUser,
  IdentityChangeOptions,
  SanitizedUser,
  UsersArrayOrPaginated,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:identityChange');

export default async function identityChange (
  options: IdentityChangeOptions,
  identifyUser: IdentifyUser,
  password: string,
  changesIdentifyUser: Record<string, unknown>,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  // note this call does not update the authenticated user info in hooks.params.user.
  debug('identityChange', password, changesIdentifyUser);

  if (params && "query" in params) {
    params = Object.assign({}, params);
    delete params.query;
  }

  const usersService = options.app.service(options.service);
  const usersServiceId = usersService.id;
  const {
    delay,
    identifyUserProps,
    longTokenLen,
    shortTokenLen,
    shortTokenDigits,
    passwordField,
    notifier,
    sanitizeUserForClient
  } = options;

  ensureObjPropsValid(identifyUser, identifyUserProps);
  ensureObjPropsValid(changesIdentifyUser, identifyUserProps);

  const users: UsersArrayOrPaginated = await usersService.find(
    Object.assign(
      {},
      params,
      { query: Object.assign({}, identifyUser, { $limit: 2 }), paginate: false }
    )
  );
  const user = getUserData(users);

  try {
    await comparePasswords(password, user[passwordField] as string);
  } catch (err) {
    throw new BadRequest('Password is incorrect.',
      { errors: { [passwordField]: 'Password is incorrect.', $className: 'badParams' } }
    );
  }

  const [verifyToken, verifyShortToken] = await Promise.all([
    getLongToken(longTokenLen),
    getShortToken(shortTokenLen, shortTokenDigits)
  ]);

  const patchedUser = await usersService.patch(user[usersServiceId], {
    verifyExpires: Date.now() + delay,
    verifyToken,
    verifyShortToken,
    verifyChanges: changesIdentifyUser
  }, Object.assign({}, params));

  const userResult = await notify(notifier, 'identityChange', patchedUser, notifierOptions);
  return sanitizeUserForClient(userResult);
}
