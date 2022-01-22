
import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import {
  comparePasswords,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  getUserData,
  hashPassword,
  notify
} from '../helpers';

import type {
  IdentifyUser,
  PasswordChangeOptions,
  SanitizedUser,
  UsersArrayOrPaginated,
  NotifierOptions
} from '../types';

const debug = makeDebug('authLocalMgnt:passwordChange');

export default async function passwordChange (
  options: PasswordChangeOptions,
  identifyUser: IdentifyUser,
  oldPassword: string,
  password: string,
  notifierOptions: NotifierOptions = {}
): Promise<SanitizedUser> {
  debug('passwordChange', oldPassword, password);

  const {
    app,
    identifyUserProps,
    passwordField,
    sanitizeUserForClient,
    service,
    notifier
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  ensureValuesAreStrings(oldPassword, password);
  ensureObjPropsValid(identifyUser, identifyUserProps);

  const users: UsersArrayOrPaginated = await usersService.find({ query: Object.assign({}, identifyUser, { $limit: 2 }), paginate: false });
  const user = getUserData(users);

  try {
    await comparePasswords(oldPassword, user.password);
  } catch (err) {
    throw new BadRequest('Current password is incorrect.', {
      errors: { oldPassword: 'Current password is incorrect.' }
    });
  }

  const patchedUser = await usersService.patch(user[usersServiceId], {
    password: await hashPassword(app, password, passwordField)
  });

  const userResult = await notify(notifier, 'passwordChange', patchedUser, notifierOptions);
  return sanitizeUserForClient(userResult);
}
