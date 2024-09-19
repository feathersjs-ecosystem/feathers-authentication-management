import { cloneObject } from './clone-object';
import type { User } from '../types';

export function sanitizeUserForClient (
  _user: Partial<User>
): Record<string, unknown> {
  const user = cloneObject(_user);

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
