import identityChange from '../identity-change';
import { SanitizedUser, IdentityChangeOptions, DataIdentityChange } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class IdentityChangeService extends AuthenticationManagementBase {
  options: IdentityChangeOptions;

  constructor (options: IdentityChangeOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataIdentityChange): Promise<SanitizedUser> {
    return await identityChange(
      this.options,
      data.value.user,
      data.value.password,
      data.value.changes,
      data.notifierOptions
    );
  }
}
