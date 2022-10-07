import { AuthenticationService } from "@feathersjs/authentication/lib";
import { Application as FeathersApplication, HookContext, Params, Query } from "@feathersjs/feathers";
import { AuthenticationManagementService, CheckUniqueService, IdentityChangeService, PasswordChangeService, ResendVerifySignupService, ResetPwdLongService, ResetPwdShortService, SendResetPwdService, User, VerifySignupLongService, VerifySignupSetPasswordLongService, VerifySignupSetPasswordShortService, VerifySignupShortService } from "../src";
import type { Service } from 'feathers-memory';

/**
 * These typings are for test purpose only
 */

export interface ParamsTest extends Params<Query> {
  call: {
    count: number
  }
}

interface ServiceTypes {
  authentication: AuthenticationService
  authManagement: AuthenticationManagementService;
  "authManagement/check-unique": CheckUniqueService
  "authManagement/identity-change": IdentityChangeService
  "authManagement/password-change": PasswordChangeService
  "authManagement/resend-verify-signup": ResendVerifySignupService
  "authManagement/reset-password-long": ResetPwdLongService
  "authManagement/reset-password-short": ResetPwdShortService
  "authManagement/send-reset-password": SendResetPwdService
  "authManagement/verify-signup-long": VerifySignupLongService
  "authManagement/verify-signup-short": VerifySignupShortService
  "authManagement/verify-signup-set-password-long": VerifySignupSetPasswordLongService
  "authManagement/verify-signup-set-password-short": VerifySignupSetPasswordShortService
  users: Service<User>
}

export type Application = FeathersApplication<ServiceTypes>

export interface HookContextTest extends HookContext<Application, Service> {}

