import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import {
  ensureObjPropsValid,
  ensureValuesAreStrings,
  getUserData,
  hashPassword,
  isDateAfterNow,
  notify
} from '../helpers';
import type { Id, Params } from '@feathersjs/feathers';
import type { VerifyChanges } from '..';

import type {
  IdentifyUser,
  SanitizedUser,
  Tokens,
  User,
  VerifySignupSetPasswordOptions,
  VerifySignupSetPasswordWithShortTokenOptions,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:verifySignupSetPassword');

export async function verifySignupSetPasswordWithLongToken (
  options: VerifySignupSetPasswordOptions,
  verifyToken: string,
  password: string,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  ensureValuesAreStrings(verifyToken, password);

  const result = await verifySignupSetPassword(
    options,
    { verifyToken },
    { verifyToken },
    password,
    notifierOptions,
    params
  );
  return result;
}

export async function verifySignupSetPasswordWithShortToken (
  options: VerifySignupSetPasswordWithShortTokenOptions,
  verifyShortToken: string,
  identifyUser: IdentifyUser,
  password: string,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  ensureValuesAreStrings(verifyShortToken, password);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  const result = await verifySignupSetPassword(
    options,
    identifyUser,
    {
      verifyShortToken
    },
    password,
    notifierOptions,
    params
  );
  return result;
}

async function verifySignupSetPassword (
  options: VerifySignupSetPasswordOptions,
  identifyUser: IdentifyUser,
  tokens: Tokens,
  password: string,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  debug('verifySignupSetPassword', identifyUser, tokens, password);

  if (params && "query" in params) {
    params = Object.assign({}, params);
    delete params.query;
  }

  const {
    app,
    passwordField,
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
  ) as User[];
  const user = getUserData(users, [
    'isNotVerifiedOrHasVerifyChanges',
    'verifyNotExpired'
  ]);

  if (!Object.keys(tokens).every((key) => tokens[key] === user[key])) {
    await eraseVerifyProps(user, user.isVerified, params);

    throw new BadRequest(
      'Invalid token. Get for a new one. (authLocalMgnt)',
      { errors: { $className: 'badParam' } }
    );
  }

  const userErasedVerify = await eraseVerifyPropsSetPassword(
    user,
    isDateAfterNow(user.verifyExpires),
    user.verifyChanges || {},
    password,
    params
  );

  const userResult = await notify(notifier, 'verifySignupSetPassword', userErasedVerify, notifierOptions);
  return sanitizeUserForClient(userResult);

  async function eraseVerifyProps (
    user: User,
    isVerified: boolean,
    params?: Params
  ): Promise<User> {
    const patchData = Object.assign({}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {},
    });

    const result = await usersService.patch(
      user[usersServiceId] as Id,
      patchData,
      Object.assign({}, params)
    ) as User;
    return result;
  }

  async function eraseVerifyPropsSetPassword (
    user: User,
    isVerified: boolean,
    verifyChanges: VerifyChanges,
    password: string,
    params?: Params
  ): Promise<User> {
    const hashedPassword = await hashPassword(app, password, passwordField);

    const patchData = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {},
      [passwordField]: hashedPassword
    });

    const result = await usersService.patch(
      user[usersServiceId] as Id,
      patchData,
      Object.assign({}, params)
    ) as User;
    return result;
  }
}
