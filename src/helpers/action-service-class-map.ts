import { Class } from 'type-fest';

import { AuthenticationManagementBase } from '../service/AuthenticationManagementBase';
import { AuthenticationManagementAction } from '../types';
import { CheckUniqueService } from '../service/CheckUniqueService';
import { IdentityChangeService } from '../service/IdentityChangeService';
import { PasswordChangeService } from '../service/PasswordChangeService';
import { ResendVerifySignupService } from '../service/ResendVerifySignupService';
import { ResetPwdLongService } from '../service/ResetPwdLongService';
import { ResetPwdShortService } from '../service/ResetPwdShortService';
import { SendResetPwdService } from '../service/SendResetPwdService';
import { VerifySignupLongService } from '../service/VerifySignupLongService';
import { VerifySignupSetPasswordLongService } from '../service/VerifySignupSetPasswordLongService';
import { VerifySignupSetPasswordShortService } from '../service/VerifySignupSetPasswordShortService';
import { VerifySignupShortService } from '../service/VerifySignupShort';

const actionServiceClassMap: Record<Exclude<AuthenticationManagementAction, 'options'>, Class<AuthenticationManagementBase>> = {
  checkUnique: CheckUniqueService,
  identityChange: IdentityChangeService,
  passwordChange: PasswordChangeService,
  resendVerifySignup: ResendVerifySignupService,
  resetPwdLong: ResetPwdLongService,
  resetPwdShort: ResetPwdShortService,
  sendResetPwd: SendResetPwdService,
  verifySignupLong: VerifySignupLongService,
  verifySignupSetPasswordLong: VerifySignupSetPasswordLongService,
  verifySignupSetPasswordShort: VerifySignupSetPasswordShortService,
  verifySignupShort: VerifySignupShortService
};

export default actionServiceClassMap;
