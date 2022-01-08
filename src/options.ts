import _cloneDeep from 'lodash/cloneDeep';
import _pick from 'lodash/pick';

import { sanitizeUserForClient } from './helpers/sanitize-user-for-client';

import type {
  NotificationType,
  User,
  AuthenticationManagementServiceOptions
} from './types';

export const defaultPath = 'authManagement';

export const optionsDefault: AuthenticationManagementServiceOptions = {
  service: '/users', // need exactly this for test suite
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifier: async (type: NotificationType, user: User, notifierOptions) => {},
  longTokenLen: 15, // token's length will be twice this
  shortTokenLen: 6,
  shortTokenDigits: true,
  resetDelay: 1000 * 60 * 60 * 2, // 2 hours
  delay: 1000 * 60 * 60 * 24 * 5, // 5 days
  resetAttempts: 0,
  reuseResetToken: false,
  identifyUserProps: ['email'],
  sanitizeUserForClient,
  skipIsVerifiedCheck: false,
  passwordField: 'password'
};

export function makeDefaultOptions<K extends keyof AuthenticationManagementServiceOptions> (
  keys?: K[]
): Pick<AuthenticationManagementServiceOptions, K> {
  const options = _cloneDeep(optionsDefault);
  if (!keys) { return options; }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return _pick(options, keys);
}
