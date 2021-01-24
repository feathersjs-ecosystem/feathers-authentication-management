
import { BadRequest } from '@feathersjs/errors';
import makeDebug from 'debug';
import comparePasswords from './helpers/compare-passwords';
import ensureObjPropsValid from './helpers/ensure-obj-props-valid';
import getLongToken from './helpers/get-long-token';
import getShortToken from './helpers/get-short-token';
import getUserData from './helpers/get-user-data';
import notifier from './helpers/notifier';
import { IdentifyUser, IdentityChangeOptions, SanitizedUser } from './types';

const debug = makeDebug('authLocalMgnt:identityChange');

// TODO: identifyUser

export default async function identityChange (
  options: IdentityChangeOptions,
  identifyUser: IdentifyUser,
  password: string,
  changesIdentifyUser: Record<string, unknown>,
  field: string,
  notifierOptions = {}
): Promise<SanitizedUser> {
  // note this call does not update the authenticated user info in hooks.params.user.
  debug('identityChange', password, changesIdentifyUser);
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  ensureObjPropsValid(identifyUser, options.identifyUserProps);
  ensureObjPropsValid(changesIdentifyUser, options.identifyUserProps);

  const users = await usersService.find({ query: identifyUser });
  const user1 = getUserData(users);

  try {
    await comparePasswords(password, user1[field] as string);
  } catch (err) {
    throw new BadRequest('Password is incorrect.',
      { errors: { [field]: 'Password is incorrect.', $className: 'badParams' } }
    );
  }

  const user2 = await usersService.patch(user1[usersServiceIdName], {
    verifyExpires: Date.now() + options.delay,
    verifyToken: await getLongToken(options.longTokenLen),
    verifyShortToken: await getShortToken(options.shortTokenLen, options.shortTokenDigits),
    verifyChanges: changesIdentifyUser
  });

  const user3 = await notifier(options.notifier, 'identityChange', user2, notifierOptions);
  return options.sanitizeUserForClient(user3);
}
