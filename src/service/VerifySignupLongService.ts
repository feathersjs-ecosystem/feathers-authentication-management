import { DataVerifySignupLong, SanitizedUser, VerifySignupOptions } from '../types';
import { verifySignupWithLongToken } from '../verify-signup';

export class VerifySignupLongService {
  options: VerifySignupOptions;

  constructor (options: VerifySignupOptions) {
    this.options = options;
  }

  async create (data: DataVerifySignupLong): Promise<SanitizedUser> {
    return await verifySignupWithLongToken(
      this.options,
      data.value,
      data.notifierOptions
    );
  }
}
