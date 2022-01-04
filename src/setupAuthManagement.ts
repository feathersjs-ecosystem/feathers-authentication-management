import makeDebug from 'debug';
import type { Application } from '@feathersjs/feathers';

import { AuthenticationManagementService } from './services/AuthenticationManagementService';
import { defaultPath, makeDefaultOptions } from './options';
import { AuthenticationManagementSetupOptions } from './types';

const debug = makeDebug('authLocalMgnt:service');

export default function authenticationLocalManagement (
  _options?: Partial<AuthenticationManagementSetupOptions>,
  docs?: Record<string, unknown>
): (app: Application) => void {
  debug('service being configured.');

  docs ??= {};

  return function (app) {
    const defaultOptions = makeDefaultOptions();
    const options = Object.assign(
      {},
      defaultOptions,
      _options
    );

    const path = _options?.path || defaultPath;

    app.use(path, new AuthenticationManagementService(app, options, docs));
  };
}
