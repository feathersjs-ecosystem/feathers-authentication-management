import _cloneDeep from 'lodash/cloneDeep';
import _pick from 'lodash/pick';

import sanitizeUserForClient from './helpers/sanitize-user-for-client';

import type {
  AuthenticationManagementConfigureOptions,
  AuthenticationManagementServiceOptionsDefault,
  NotificationType,
  User
} from './types';

export const optionsDefault: AuthenticationManagementServiceOptionsDefault = {
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

export function makeDefaultOptions<K extends keyof AuthenticationManagementServiceOptionsDefault> (keys: K[]): Pick<AuthenticationManagementServiceOptionsDefault, K> {
  const options = _cloneDeep(optionsDefault);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return _pick(options, keys);
}

const defaultPath = 'authManagement';

export const defaultConfigureOptions = {
  path: defaultPath
};

export const makeDefaultConfigureOptions = (): AuthenticationManagementConfigureOptions => {
  const defaultServiceOptions: AuthenticationManagementServiceOptionsDefault = makeDefaultOptions([
    'service',
    'notifier',
    'longTokenLen',
    'shortTokenLen',
    'shortTokenDigits',
    'resetDelay',
    'delay',
    'resetAttempts',
    'reuseResetToken',
    'identifyUserProps',
    'sanitizeUserForClient',
    'skipIsVerifiedCheck',
    'passwordField'
  ]);

  return Object.assign({}, defaultServiceOptions, defaultConfigureOptions);
};
