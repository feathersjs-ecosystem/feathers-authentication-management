import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import {
  comparePasswords,
  deconstructId,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  getUserData,
  hashPassword,
  notify
} from '../helpers';

import type {
  UsersArrayOrPaginated,
  IdentifyUser,
  ResetPasswordOptions,
  ResetPwdWithShortTokenOptions,
  SanitizedUser,
  Tokens,
  GetUserDataCheckProps,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:resetPassword');

export async function resetPwdWithLongToken (
  options: ResetPasswordOptions,
  resetToken: string,
  password: string,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  ensureValuesAreStrings(resetToken, password);

  return await resetPassword(
    options,
    { resetToken },
    { resetToken },
    password,
    notifierOptions
  );
}

export async function resetPwdWithShortToken (
  options: ResetPwdWithShortTokenOptions,
  resetShortToken: string,
  identifyUser: IdentifyUser,
  password: string,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  ensureValuesAreStrings(resetShortToken, password);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  return await resetPassword(
    options,
    identifyUser,
    { resetShortToken },
    password,
    notifierOptions
  );
}

async function resetPassword (
  options: ResetPasswordOptions,
  identifyUser: IdentifyUser,
  tokens: Tokens,
  password: string,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  debug('resetPassword', identifyUser, tokens, password);

  const {
    app,
    service,
    skipIsVerifiedCheck,
    reuseResetToken,
    passwordField,
    sanitizeUserForClient,
    notifier
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;
  let users: UsersArrayOrPaginated;

  if (tokens.resetToken) {
    const id = deconstructId(tokens.resetToken);
    const user = await usersService.get(id);
    users = [user];
  } else if (tokens.resetShortToken) {
    users = await usersService.find({ query: Object.assign({}, identifyUser, { $limit: 2 }), paginate: false });
  } else {
    throw new BadRequest(
      'resetToken and resetShortToken are missing. (authLocalMgnt)',
      { errors: { $className: 'missingToken' } }
    );
  }

  const checkProps: GetUserDataCheckProps = skipIsVerifiedCheck ? ['resetNotExpired'] : ['resetNotExpired', 'isVerified'];
  const user = getUserData(users, checkProps);

  // compare all tokens (hashed)
  const tokenChecks = Object.keys(tokens).map(async key => {
    if (reuseResetToken) {
      // Comparing token directly as reused resetToken is not hashed
      if (tokens[key] !== user[key]) {
        throw new BadRequest('Reset Token is incorrect. (authLocalMgnt)', {
          errors: { $className: 'incorrectToken' }
        });
      }
    } else {
      return await comparePasswords(
        tokens[key],
        user[key] as string,
        () =>
          new BadRequest(
            'Reset Token is incorrect. (authLocalMgnt)',
            { errors: { $className: 'incorrectToken' } }
          )
      );
    }
  });

  try {
    await Promise.all(tokenChecks);
  } catch (err) {
    // if token check fail, either decrease remaining attempts or cancel reset
    if (user.resetAttempts > 0) {
      await usersService.patch(user[usersServiceId], {
        resetAttempts: user.resetAttempts - 1
      });

      throw err;
    } else {
      await usersService.patch(user[usersServiceId], {
        resetToken: null,
        resetAttempts: null,
        resetShortToken: null,
        resetExpires: null
      });

      throw new BadRequest(
        'Invalid token. Get for a new one. (authLocalMgnt)',
        { errors: { $className: 'invalidToken' } });
    }
  }

  const patchedUser = await usersService.patch(user[usersServiceId], {
    [passwordField]: await hashPassword(app, password, passwordField),
    resetExpires: null,
    resetAttempts: null,
    resetToken: null,
    resetShortToken: null
  });

  const userResult = await notify(notifier, 'resetPwd', patchedUser, notifierOptions);
  return sanitizeUserForClient(userResult);
}
