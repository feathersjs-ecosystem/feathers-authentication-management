import passwordChange from '../password-change';
import { SanitizedUser, DataPasswordChange, PasswordChangeOptions } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class PasswordChangeService extends AuthenticationManagementBase {
  options: PasswordChangeOptions;

  constructor (options: PasswordChangeOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataPasswordChange): Promise<SanitizedUser> {
    return await passwordChange(
      this.options,
      data.value.user,
      data.value.oldPassword,
      data.value.password,
      data.notifierOptions
    );
  }
}
