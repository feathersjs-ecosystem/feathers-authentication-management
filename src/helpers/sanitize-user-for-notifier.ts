import { cloneObject } from './clone-object';
import type { User } from '../types';

export function sanitizeUserForNotifier (_user: User): Record<string, unknown> {
  const user = cloneObject(_user);
  delete user.password;
  return user;
}
