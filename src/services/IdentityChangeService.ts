import { makeDefaultOptions } from '../options';
import identityChange from '../methods/identity-change';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataIdentityChange,
  IdentityChangeServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class IdentityChangeService
  extends AuthenticationManagementBase<DataIdentityChange, SanitizedUser, IdentityChangeServiceOptions> {
  constructor (app: Application, options?: Partial<IdentityChangeServiceOptions>) {
    super(app);

    const defaultOptions: IdentityChangeServiceOptions = makeDefaultOptions([
      'service',
      'notifier',
      'longTokenLen',
      'shortTokenLen',
      'shortTokenDigits',
      'delay',
      'identifyUserProps',
      'sanitizeUserForClient',
      'passwordField',
      'passParams'
    ]);

    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataIdentityChange, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await identityChange(
      this.optionsWithApp,
      data.user,
      data.password,
      data.changes,
      data.notifierOptions,
      passedParams
    );
  }
}
