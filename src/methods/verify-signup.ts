import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import {
  ensureObjPropsValid,
  ensureValuesAreStrings,
  getUserData,
  notify,
  isDateAfterNow
} from '../helpers';
import type { Id, Params } from '@feathersjs/feathers';

import type {
  SanitizedUser,
  VerifySignupOptions,
  VerifySignupWithShortTokenOptions,
  Tokens,
  User,
  IdentifyUser,
  NotifierOptions,
  VerifyChanges
} from '../types';

const debug = makeDebug('authLocalMgnt:verifySignup');

export async function verifySignupWithLongToken (
  options: VerifySignupOptions,
  verifyToken: string,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  ensureValuesAreStrings(verifyToken);

  const result = await verifySignup(
    options,
    { verifyToken },
    { verifyToken },
    notifierOptions,
    params
  );
  return result;
}

export async function verifySignupWithShortToken (
  options: VerifySignupWithShortTokenOptions,
  verifyShortToken: string,
  identifyUser: IdentifyUser,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  ensureValuesAreStrings(verifyShortToken);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  const result = await verifySignup(
    options,
    identifyUser,
    { verifyShortToken },
    notifierOptions,
    params
  );
  return result;
}

async function verifySignup (
  options: VerifySignupOptions,
  identifyUser: IdentifyUser,
  tokens: Tokens,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  debug('verifySignup', identifyUser, tokens);

  if (params && "query" in params) {
    params = Object.assign({}, params);
    delete params.query;
  }

  const {
    app,
    sanitizeUserForClient,
    service,
    notifier
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  const users = await usersService.find(
    Object.assign(
      {},
      params,
      { query: Object.assign({}, identifyUser, { $limit: 2 }), paginate: false }
    )
  );
  const user = getUserData(users, [
    'isNotVerifiedOrHasVerifyChanges',
    'verifyNotExpired'
  ]);

  let userErasedVerify: User;

  if (!Object.keys(tokens).every(key => tokens[key] === user[key])) {
    userErasedVerify = await eraseVerifyProps(user, user.isVerified);

    throw new BadRequest(
      'Invalid token. Get for a new one. (authLocalMgnt)',
      { errors: { $className: 'badParam' } }
    );
  } else {
    userErasedVerify = await eraseVerifyProps(
      user,
      isDateAfterNow(user.verifyExpires),
      user.verifyChanges || {},
      params
    );
  }

  const userResult = await notify(notifier, 'verifySignup', userErasedVerify, notifierOptions);
  return sanitizeUserForClient(userResult);

  async function eraseVerifyProps (
    user: User,
    isVerified: boolean,
    verifyChanges?: VerifyChanges,
    params?: Params
  ): Promise<User> {
    const patchData = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {}
    });

    const result = await usersService.patch(
      user[usersServiceId] as Id,
      patchData,
      Object.assign({}, params)
    );
    return result;
  }
}
