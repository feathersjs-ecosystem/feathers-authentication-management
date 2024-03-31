
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
import type { Id, Params } from '@feathersjs/feathers';

import type {
  IdentifyUser,
  PasswordChangeOptions,
  SanitizedUser,
  NotifierOptions,
  User
} from '../types';

const debug = makeDebug('authLocalMgnt:passwordChange');

export default async function passwordChange (
  options: PasswordChangeOptions,
  identifyUser: IdentifyUser,
  oldPassword: string,
  password: string,
  notifierOptions: NotifierOptions = {},
  params?: Params
): Promise<SanitizedUser> {
  debug('passwordChange', oldPassword, password);

  if (params && "query" in params) {
    params = Object.assign({}, params);
    delete params.query;
  }

  const {
    app,
    identifyUserProps,
    passwordField,
    sanitizeUserForClient,
    service,
    notifier
  } = options;

  const usersService = app.service(service);
  const usersServiceId = usersService.id!;

  ensureValuesAreStrings(oldPassword, password);
  ensureObjPropsValid(identifyUser, identifyUserProps);

  const users = await usersService.find({
    ...params,
    query: { ...identifyUser, $limit: 2 },
    paginate: false,
  }) as User[];
  const user = getUserData(users);

  try {
    await comparePasswords(oldPassword, user.password);
  } catch (err) {
    throw new BadRequest('Current password is incorrect.', {
      errors: { oldPassword: 'Current password is incorrect.' }
    });
  }

  const patchedUser = await usersService.patch(user[usersServiceId] as Id, {
    password: await hashPassword(app, password, passwordField)
  }, Object.assign({}, params)) as User;

  const userResult = await notify(notifier, 'passwordChange', patchedUser, notifierOptions);
  return sanitizeUserForClient(userResult);
}
