
import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import comparePasswords from '../helpers/compare-passwords';
import ensureObjPropsValid from '../helpers/ensure-obj-props-valid';
import ensureValuesAreStrings from '../helpers/ensure-values-are-strings';
import getUserData from '../helpers/get-user-data';
import hashPassword from '../helpers/hash-password';
import notifier from '../helpers/notifier';

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
    service
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id;

  ensureValuesAreStrings(oldPassword, password);
  ensureObjPropsValid(identifyUser, identifyUserProps);

  const users: UsersArrayOrPaginated = await usersService.find({ query: identifyUser });
  const user1 = getUserData(users);

  try {
    await comparePasswords(oldPassword, user1.password);
  } catch (err) {
    throw new BadRequest('Current password is incorrect.', {
      errors: { oldPassword: 'Current password is incorrect.' }
    });
  }

  const user2 = await usersService.patch(user1[usersServiceId], {
    password: await hashPassword(app, password, passwordField)
  });

  const user3 = await notifier(options.notifier, 'passwordChange', user2, notifierOptions);
  return sanitizeUserForClient(user3);
}
