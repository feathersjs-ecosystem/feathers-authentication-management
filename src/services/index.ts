import { AuthenticationManagementService } from './AuthenticationManagementService';

import { CheckUniqueService } from './CheckUniqueService';
import { IdentityChangeService } from './IdentityChangeService';
import { PasswordChangeService } from './PasswordChangeService';
import { ResendVerifySignupService } from './ResendVerifySignupService';
import { ResetPwdLongService } from './ResetPwdLongService';
import { ResetPwdShortService } from './ResetPwdShortService';
import { SendResetPwdService } from './SendResetPwdService';
import { VerifySignupLongService } from './VerifySignupLongService';
import { VerifySignupSetPasswordLongService } from './VerifySignupSetPasswordLongService';
import { VerifySignupSetPasswordShortService } from './VerifySignupSetPasswordShortService';
import { VerifySignupShortService } from './VerifySignupShortService';

const services = {
  AuthenticationManagementService,
  IdentityChangeService,
  PasswordChangeService,
  ResendVerifySignupService,
  ResetPwdLongService,
  ResetPwdShortService,
  SendResetPwdService,
  VerifySignupLongService,
  VerifySignupSetPasswordLongService,
  VerifySignupSetPasswordShortService,
  VerifySignupShortService,
  CheckUniqueService
};

export {
  AuthenticationManagementService,
  IdentityChangeService,
  PasswordChangeService,
  ResendVerifySignupService,
  ResetPwdLongService,
  ResetPwdShortService,
  SendResetPwdService,
  VerifySignupLongService,
  VerifySignupSetPasswordLongService,
  VerifySignupSetPasswordShortService,
  VerifySignupShortService,
  CheckUniqueService
};

export default services;

// commonjs
if (typeof module !== 'undefined') {
  module.exports = Object.assign(services, module.exports);
}
