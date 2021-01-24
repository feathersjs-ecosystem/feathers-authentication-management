import makeDebug from 'debug';
import sanitizeUserForClient from '../helpers/sanitize-user-for-client';
import { AuthenticationManagementOptions, AuthenticationManagementOptionsDefault } from '../types';
import { AuthenticationManagementService } from './AuthenticationManagementService';

const debug = makeDebug('authLocalMgnt:service');

const optionsDefault: AuthenticationManagementOptionsDefault = {
  app: null, // value set during configuration
  service: '/users', // need exactly this for test suite
  path: 'authManagement',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  notifier: async () => {},
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

export default function authenticationLocalManagement (
  options1?: Partial<AuthenticationManagementOptions>,
  docs?: Record<string, unknown>
): () => void {
  debug('service being configured.');

  docs = docs ?? {};

  return function () {
    const options = Object.assign({}, optionsDefault, options1, { app: this });
    options.app.use(options.path, new AuthenticationManagementService(options, docs));
  };
}

export { AuthenticationManagementService };
