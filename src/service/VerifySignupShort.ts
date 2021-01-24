import { DataVerifySignupShort, SanitizedUser, VerifySignupWithShortTokenOptions } from '../types';
import { verifySignupWithShortToken } from '../verify-signup';

export class VerifySignupShortService {
  options: VerifySignupWithShortTokenOptions;

  constructor (options: VerifySignupWithShortTokenOptions) {
    this.options = options;
  }

  async create (data: DataVerifySignupShort): Promise<SanitizedUser> {
    return await verifySignupWithShortToken(
      this.options,
      data.value.token,
      data.value.user,
      data.notifierOptions
    );
  }
}
