import identityChange from '../identity-change';
import { SanitizedUser, IdentityChangeOptions, DataIdentityChange } from '../types';

export class IdentityChangeService {
  options: IdentityChangeOptions;

  constructor (options: IdentityChangeOptions) {
    this.options = options;
  }

  async create (data: DataIdentityChange): Promise<SanitizedUser> {
    return await identityChange(
      this.options,
      data.value.user,
      data.value.password,
      data.value.changes,
      data.notifierOptions
    );
  }
}
