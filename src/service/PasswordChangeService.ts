import passwordChange from '../password-change';
import { SanitizedUser, DataPasswordChange, PasswordChangeOptions } from '../types';

export class PasswordChangeService {
  options: PasswordChangeOptions;

  constructor (options: PasswordChangeOptions) {
    this.options = options;
  }

  async create (data: DataPasswordChange): Promise<SanitizedUser> {
    return await passwordChange(
      this.options,
      data.value.user,
      data.value.oldPassword,
      data.value.password,
      data.notifierOptions
    );
  }
}
