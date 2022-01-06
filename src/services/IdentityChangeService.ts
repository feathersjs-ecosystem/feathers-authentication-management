import { makeDefaultOptions } from '../options';
import identityChange from '../methods/identity-change';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataIdentityChange,
  IdentityChangeServiceOptions
} from '../types';
import type { Application } from '@feathersjs/feathers';

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
      'passwordField'
    ]);

    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataIdentityChange): Promise<SanitizedUser> {
    return await identityChange(
      this.optionsWithApp,
      data.value.user,
      data.value.password,
      data.value.changes,
      data.notifierOptions
    );
  }
}
