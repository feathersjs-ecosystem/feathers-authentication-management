import { makeDefaultOptions } from '../options';

import { verifySignupWithLongToken } from '../methods/verify-signup';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';
import type { Application, Params } from '@feathersjs/feathers';

import type {
  DataVerifySignupLong,
  SanitizedUser,
  VerifySignupLongServiceOptions
} from '../types';

export class VerifySignupLongService
  extends AuthenticationManagementBase<DataVerifySignupLong, SanitizedUser, VerifySignupLongServiceOptions> {
  constructor (app: Application, options?: Partial<VerifySignupLongServiceOptions>) {
    super(app);

    const defaultOptions: VerifySignupLongServiceOptions = makeDefaultOptions([
      'service',
      'notifier',
      'sanitizeUserForClient',
      'passParams'
    ]);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataVerifySignupLong, params?: Params): Promise<SanitizedUser> {
    const passedParams = this.options.passParams && await this.options.passParams(params);

    return await verifySignupWithLongToken(
      this.optionsWithApp,
      data.token,
      data.notifierOptions,
      passedParams
    );
  }
}
