import _cloneDeep from 'lodash/cloneDeep';
import _pick from 'lodash/pick';

import {
  AuthenticationManagementServiceOptionsDefault,
  NotificationType,
  User
} from '../types';
import sanitizeUserForClient from '../helpers/sanitize-user-for-client';

export { AuthenticationManagementService } from './AuthenticationManagementService';
export { CheckUniqueService } from './CheckUniqueService';
export { IdentityChangeService } from './IdentityChangeService';
export { PasswordChangeService } from './PasswordChangeService';
export { ResendVerifySignupService } from './ResendVerifySignupService';
export { ResetPwdLongService } from './ResetPwdLongService';
export { ResetPwdShortService } from './ResetPwdShortService';
export { SendResetPwdService } from './SendResetPwdService';
export { VerifySignupLongService } from './VerifySignupLongService';
export { VerifySignupSetPasswordLongService } from './VerifySignupSetPasswordLongService';
export { VerifySignupSetPasswordShortService } from './VerifySignupSetPasswordShortService';
export { VerifySignupShortService } from './VerifySignupShort';

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
