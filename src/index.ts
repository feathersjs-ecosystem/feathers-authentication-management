import setup from './setupAuthManagement';

import addVerification from './hooks/add-verification';
import isVerified from './hooks/is-verified';
import removeVerification from './hooks/remove-verification';

export default setup;

export const hooks = {
  addVerification,
  isVerified,
  removeVerification
};

export { addVerification };
export { isVerified };
export { removeVerification };

export { AuthenticationManagementService } from './services/AuthenticationManagementService';
export { CheckUniqueService } from './services/CheckUniqueService';
export { IdentityChangeService } from './services/IdentityChangeService';
export { PasswordChangeService } from './services/PasswordChangeService';
export { ResendVerifySignupService } from './services/ResendVerifySignupService';
export { ResetPwdLongService } from './services/ResetPwdLongService';
export { ResetPwdShortService } from './services/ResetPwdShortService';
export { SendResetPwdService } from './services/SendResetPwdService';
export { VerifySignupLongService } from './services/VerifySignupLongService';
export { VerifySignupSetPasswordLongService } from './services/VerifySignupSetPasswordLongService';
export { VerifySignupSetPasswordShortService } from './services/VerifySignupSetPasswordShortService';
export { VerifySignupShortService } from './services/VerifySignupShortService';

export * from './types';

export { default as client } from './client';

// commonjs
if (typeof module !== 'undefined') {
  module.exports = Object.assign(setup, module.exports);
}
