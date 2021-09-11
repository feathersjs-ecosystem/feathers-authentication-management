
import cloneObject from './clone-object';

import type {
  User
} from '../types';

export default function sanitizeUserForClient (_user: User): Record<string, unknown> {
  const user = cloneObject<User>(_user);

  delete user.password;
  delete user.verifyExpires;
  delete user.verifyToken;
  delete user.verifyShortToken;
  delete user.verifyChanges;
  delete user.resetExpires;
  delete user.resetToken;
  delete user.resetShortToken;

  return user;
}
