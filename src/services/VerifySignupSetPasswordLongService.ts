import { makeDefaultOptions } from '../options';
import { verifySignupSetPasswordWithLongToken } from '../methods/verify-signup-set-password';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';
import type {
  DataVerifySignupSetPasswordLong,
  SanitizedUser,
  VerifySignupSetPasswordLongServiceOptions
} from '../types';
import type { Application, Params } from '@feathersjs/feathers';

export class VerifySignupSetPasswordLongService
  extends AuthenticationManagementBase<DataVerifySignupSetPasswordLong, SanitizedUser, VerifySignupSetPasswordLongServiceOptions> {
  constructor (app: Application, options?: Partial<VerifySignupSetPasswordLongServiceOptions>) {
    super(app);

    const defaultOptions: VerifySignupSetPasswordLongServiceOptions = makeDefaultOptions([
      'service',
      'notifier',
      'sanitizeUserForClient',
      'passwordField',
      'passParams'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataVerifySignupSetPasswordLong, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await verifySignupSetPasswordWithLongToken(
      this.optionsWithApp,
      data.token,
      data.password,
      data.notifierOptions,
      passedParams
    );
  }
}
