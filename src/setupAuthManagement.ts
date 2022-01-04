import makeDebug from 'debug';
import type { Application } from '@feathersjs/feathers';

import { AuthenticationManagementService } from './services/AuthenticationManagementService';
import { makeDefaultSetupOptions } from './options';
import { AuthenticationManagementSetupOptions } from './types';

const debug = makeDebug('authLocalMgnt:service');

export default function authenticationLocalManagement (
  _options?: Partial<AuthenticationManagementSetupOptions>,
  docs?: Record<string, unknown>
): (app: Application) => void {
  debug('service being configured.');

  docs ??= {};

  return function (app) {
    const defaultOptions = makeDefaultSetupOptions();
    const options = Object.assign(
      {},
      defaultOptions,
      _options,
      {
        app
      }
    );

    app.use(options.path, new AuthenticationManagementService(options, docs));
  };
}
