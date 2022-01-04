import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import ensureObjPropsValid from '../helpers/ensure-obj-props-valid';
import ensureValuesAreStrings from '../helpers/ensure-values-are-strings';
import getUserData from '../helpers/get-user-data';
import hashPassword from '../helpers/hash-password';
import isDateAfterNow from '../helpers/is-date-after-now';
import notifier from '../helpers/notifier';

import type {
  IdentifyUser,
  SanitizedUser,
  Tokens,
  User,
  VerifyChanges,
  VerifySignupSetPasswordOptions,
  VerifySignupSetPasswordWithShortTokenOptions,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:verifySignupSetPassword');

export async function verifySignupSetPasswordWithLongToken (
  options: VerifySignupSetPasswordOptions,
  verifyToken: string,
  password: string,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  ensureValuesAreStrings(verifyToken, password);

  const result = await verifySignupSetPassword(
    options,
    { verifyToken },
    { verifyToken },
    password,
    notifierOptions
  );
  return result;
}

export async function verifySignupSetPasswordWithShortToken (
  options: VerifySignupSetPasswordWithShortTokenOptions,
  verifyShortToken: string,
  identifyUser: IdentifyUser,
  password: string,
  notifierOptions: NotifierOptions = {}
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
    notifierOptions
  );
  return result;
}

async function verifySignupSetPassword (
  options: VerifySignupSetPasswordOptions,
  identifyUser: IdentifyUser,
  tokens: Tokens,
  password: string,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  debug('verifySignupSetPassword', identifyUser, tokens, password);

  const {
    app,
    passwordField,
    sanitizeUserForClient,
    service
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  const users = await usersService.find({ query: Object.assign({ $limit: 2 }, identifyUser ) });
  const user1 = getUserData(users, [
    'isNotVerifiedOrHasVerifyChanges',
    'verifyNotExpired'
  ]);

  if (!Object.keys(tokens).every((key) => tokens[key] === user1[key])) {
    await eraseVerifyProps(user1, user1.isVerified, {});

    throw new BadRequest(
      'Invalid token. Get for a new one. (authLocalMgnt)',
      { errors: { $className: 'badParam' } }
    );
  }

  const user2 = await eraseVerifyPropsSetPassword(
    user1,
    isDateAfterNow(user1.verifyExpires),
    user1.verifyChanges || {},
    password
  );

  const user3 = await notifier(options.notifier, 'verifySignupSetPassword', user2, notifierOptions);
  return sanitizeUserForClient(user3);

  async function eraseVerifyProps (
    user: User,
    isVerified: boolean,
    verifyChanges: VerifyChanges
  ): Promise<User> {
    const patchToUser = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {}
    });

    const result = await usersService.patch(user[usersServiceId], patchToUser, {});
    return result;
  }

  async function eraseVerifyPropsSetPassword (
    user: User,
    isVerified: boolean,
    verifyChanges: VerifyChanges,
    password: string
  ): Promise<User> {
    const hashedPassword = await hashPassword(app, password, passwordField);

    const patchToUser = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {},
      password: hashedPassword
    });

    const result = await usersService.patch(user[usersServiceId], patchToUser, {});
    return result;
  }
}
