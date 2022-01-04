import makeDebug from 'debug';
import type { Application } from '@feathersjs/feathers';

import { AuthenticationManagementService } from './services/AuthenticationManagementService';
import { makeDefaultConfigureOptions } from './options';
import { AuthenticationManagementConfigureOptions } from './types';

const debug = makeDebug('authLocalMgnt:service');

export default function authenticationLocalManagement (
  _options?: Partial<AuthenticationManagementConfigureOptions>,
  docs?: Record<string, unknown>
): (app: Application) => void {
  debug('service being configured.');

  docs ??= {};

  return function (app) {
    const defaultOptions = makeDefaultConfigureOptions();
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
