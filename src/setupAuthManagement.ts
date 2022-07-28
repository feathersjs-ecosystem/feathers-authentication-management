import makeDebug from 'debug';

import { AuthenticationManagementService } from './services/AuthenticationManagementService';
import { defaultPath, makeDefaultOptions } from './options';
import type { AuthenticationManagementSetupOptions } from './types';
import type { Application } from '@feathersjs/feathers';

const debug = makeDebug('authLocalMgnt:service');

export default function authenticationLocalManagement (
  _options?: Partial<AuthenticationManagementSetupOptions>,
  docs?: Record<string, unknown>
): (app: Application) => void {
  debug('service being configured.');

  return function (app) {
    const defaultOptions = makeDefaultOptions();
    const options = Object.assign(
      {},
      defaultOptions,
      _options
    );

    const path = _options?.path || defaultPath;

    const service = new AuthenticationManagementService(app, options);

    if (docs) {
      // @ts-expect-error service does not have docs
      service.docs = docs;
    }

    app.use(path, service);
  };
}
