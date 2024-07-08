import { makeDefaultOptions } from '../options';
import passwordChange from '../methods/password-change';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

import type {
  SanitizedUser,
  DataPasswordChange,
  PasswordChangeOptions,
  PasswordChangeServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class PasswordChangeService
  extends AuthenticationManagementBase<DataPasswordChange, SanitizedUser, PasswordChangeServiceOptions> {
  constructor (app: Application, options?: Partial<PasswordChangeOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions([
      'service',
      'notifier',
      'identifyUserProps',
      'sanitizeUserForClient',
      'passwordField',
      'skipPasswordHash',
      'passParams'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataPasswordChange, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await passwordChange(
      this.optionsWithApp,
      data.user,
      data.oldPassword,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }
}
