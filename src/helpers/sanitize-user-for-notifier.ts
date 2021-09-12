
import cloneObject from './clone-object';

import {
  User
} from '../types';

export default function sanitizeUserForNotifier (_user: User): Record<string, unknown> {
  const user = cloneObject<User>(_user);
  delete user.password;
  return user;
}
