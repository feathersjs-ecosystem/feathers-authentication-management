/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Application, Id, Paginated, Params, Query } from '@feathersjs/feathers';

//#region general

export interface User {
  isVerified: boolean
  verifyToken: string
  verifyShortToken: string
  verifyExpires: Date | number // unix
  verifyChanges: VerifyChanges
  resetToken: string
  resetShortToken: string
  resetExpires: Date | number // unix
  resetAttempts: number
  password: string
  [key: string]: any
  [key: number]: any
}

export type ArrayOrPaginated<T> = T[] | Paginated<T>;

export type UsersArrayOrPaginated = ArrayOrPaginated<User>;
export type NotifierOptions = Record<string, any>;
export type VerifyChanges = Record<string, any>;

export interface Tokens {
  resetToken?: string
  resetShortToken?: string
  verifyShortToken?: string
  verifyToken?: string
}

export type IdentifyUser = Query;

export type Notifier = (type: NotificationType, user: Partial<User>, notifierOptions?: NotifierOptions) => any;
export type SanitizeUserForClient = (user: Partial<User>) => SanitizedUser;

export type SanitizedUser = Partial<User>;

export type NotificationType =
  'resendVerifySignup' |
  'verifySignup' |
  'verifySignupSetPassword' |
  'sendResetPwd' |
  'resetPwd' |
  'passwordChange' |
  'identityChange';

// #endregion

export type AuthenticationManagementAction =
  'checkUnique' |
  'resendVerifySignup' |
  'verifySignupLong' |
  'verifySignupShort' |
  'verifySignupSetPasswordLong' |
  'verifySignupSetPasswordShort' |
  'sendResetPwd' |
  'resetPwdLong' |
  'resetPwdShort' |
  'passwordChange' |
  'identityChange' |
  'options';

export type ActionPathMap<T> = {
  [key in Exclude<AuthenticationManagementAction, 'options'>]: T
};

export type GetUserDataCheckProps = Array<'isNotVerified' | 'isNotVerifiedOrHasVerifyChanges' | 'isVerified' | 'verifyNotExpired' | 'resetNotExpired'>;

//#region options

export interface AuthenticationManagementServiceOptions {
  /** The path of the service for user items.
   * @default "/users" */
  service: string
  /** If `false` (default) it is impossible to reset passwords even if e-mail is not verified.
   * @default false */
  skipIsVerifiedCheck: boolean
  /** The notifier function handles the sending of any notification depending on the action.
   */
  notifier: Notifier
  /** Half the length of the long token. Default is 15, giving tokens of 30 characters length.
   * @default 15 */
  longTokenLen: number
  /** Length of short token (e.g. for sms).
   * @default 6 */
  shortTokenLen: number
  /** If `true` short tokens contain only digits. Otherwise also characters.
   * @default true */
  shortTokenDigits: boolean
  /** Lifetime for password reset tokens in ms. Default is 2*60*60*1000 = 7200000 (2 hours).
   * @default 7200000 */
  resetDelay: number
  /** Lifetime for e-mail verification tokens in ms. Default is 5*24*60*60*1000 = 432000000 (5 days).
   * @default 432000000
  */
  delay: number
  /** Amount of times a user can submit an invalid token before the current token gets removed from the database. Default is 0.
   * @default 0 */
  resetAttempts: number
  /** Use the same reset token if the user resets password twice in a short period. In this case token is not hashed in the database. Default is false.
   * @default false */
  reuseResetToken: boolean
  /** Property names in the user item which uniquely identify the user, e.g. `['username', 'email', 'cellphone']`. The default is `['email']`. Only these properties may be changed with verification by the service. At least one of these properties must be provided whenever a short token is used, as the short token alone is too susceptible to brute force attack.
   * @default ['email']
   */
  identifyUserProps: string[]
  /** Used for sanitization reasions. By default, the user object is in the response e. g. of a password reset request. To reply with empty object use `() => ({})`.
   * Deletes the following properties by default: `['password', 'verifyExpires', 'verifyToken', 'verifyShortToken', 'verifyChanges', 'resetExpires', 'resetToken', 'resetShortToken']`
   */
  sanitizeUserForClient: (user: User) => Partial<User>
  /** Property name of the password field on your `'/users'` service
   * @default 'password' */
  passwordField: string
  /** Pass params from f-a-m service to `/users` service */
  passParams: (params) => Params | Promise<Params>
}

export type AuthenticationManagementSetupOptions = AuthenticationManagementServiceOptions & { path: string };

export type VerifySignupLongServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'notifier' |
'sanitizeUserForClient' |
'passParams'>;

export type VerifySignupOptions = VerifySignupLongServiceOptions & { app: Application };

export type VerifySignupShortServiceOptions = VerifySignupLongServiceOptions & {
  identifyUserProps: string[]
};
export type VerifySignupWithShortTokenOptions = VerifySignupShortServiceOptions & { app: Application };

export type VerifySignupSetPasswordLongServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'sanitizeUserForClient' |
'notifier' |
'passwordField' |
'passParams'>;
export type VerifySignupSetPasswordOptions = VerifySignupSetPasswordLongServiceOptions & { app: Application };

export type PasswordChangeServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'identifyUserProps' |
'notifier' |
'sanitizeUserForClient' |
'passwordField' |
'passParams'>;
export type PasswordChangeOptions = PasswordChangeServiceOptions & { app: Application };

export type VerifySignupSetPasswordShortServiceOptions = VerifySignupSetPasswordLongServiceOptions
& Pick<AuthenticationManagementServiceOptions, 'identifyUserProps'>;
export type VerifySignupSetPasswordWithShortTokenOptions = VerifySignupSetPasswordShortServiceOptions & { app: Application };

export type ResetPasswordServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'skipIsVerifiedCheck' |
'reuseResetToken' |
'notifier' |
'sanitizeUserForClient' |
'passwordField' |
'passParams'>;
export type ResetPasswordOptions = ResetPasswordServiceOptions & { app: Application };

export type ResetPwdWithShortServiceOptions = ResetPasswordServiceOptions & {
  identifyUserProps: string[]
};
export type ResetPwdWithShortTokenOptions = ResetPwdWithShortServiceOptions & { app: Application };

export type ResendVerifySignupServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'identifyUserProps' |
'delay' |
'longTokenLen' |
'shortTokenLen' |
'shortTokenDigits' |
'notifier' |
'sanitizeUserForClient' |
'passParams'>;
export type ResendVerifySignupOptions = ResendVerifySignupServiceOptions & { app: Application };

export type IdentityChangeServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'identifyUserProps' |
'delay' |
'longTokenLen' |
'shortTokenLen' |
'shortTokenDigits' |
'notifier' |
'sanitizeUserForClient' |
'passwordField' |
'passParams'>;
export type IdentityChangeOptions = IdentityChangeServiceOptions & { app: Application };

export type CheckUniqueServiceOptions = Pick<AuthenticationManagementServiceOptions, 'service' | 'passParams'>;
export type CheckUniqueOptions = CheckUniqueServiceOptions & { app: Application };

export type SendResetPwdServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'identifyUserProps' |
'skipIsVerifiedCheck' |
'reuseResetToken' |
'resetDelay' |
'sanitizeUserForClient' |
'resetAttempts' |
'shortTokenLen' |
'longTokenLen' |
'shortTokenDigits' |
'notifier' |
'passwordField' |
'passParams'>;

export type SendResetPwdOptions = SendResetPwdServiceOptions & { app: Application };

//#endregion

//#region client
export interface AuthenticationManagementClient {
  checkUnique: (identifyUser: IdentifyUser, ownId?: Id, ifErrMsg?: boolean) => Promise<void>
  resendVerifySignup: (identifyUser: IdentifyUser, notifierOptions: NotifierOptions) => Promise<void>
  verifySignupLong: (verifyToken: string) => Promise<void>
  verifySignupShort: (verifyToken: string, identifyUser: IdentifyUser) => Promise<void>
  sendResetPwd: (IdentifyUser: IdentifyUser, notifierOptions: NotifierOptions) => Promise<void>
  resetPwdLong: (resetToken: string, password: string) => Promise<void>
  resetPwdShort: (resetShortToken: string, identifyUser: IdentifyUser, password: string) => Promise<void>
  passwordChange: (oldPassword: string, password: string, identifyUser: IdentifyUser) => Promise<void>
  identityChange: (password: string, changesIdentifyUser: NotifierOptions, identifyUser: IdentifyUser) => Promise<void>
  authenticate: (email: string, password: string, cb?: (err: Error | null, user?: Partial<User>) => void) => Promise<any>
}

//#endregion

//#region service data

export interface WithNotifierOptions {
  notifierOptions?: NotifierOptions
}

export type AuthenticationManagementData =
  DataCheckUniqueWithAction |
  DataIdentityChangeWithAction |
  DataOptions |
  DataPasswordChangeWithAction |
  DataResendVerifySignupWithAction |
  DataResetPwdLongWithAction |
  DataResetPwdShortWithAction |
  DataSendResetPwdWithAction |
  DataVerifySignupLongWithAction |
  DataVerifySignupSetPasswordLongWithAction |
  DataVerifySignupSetPasswordShortWithAction |
  DataVerifySignupShortWithAction;

export interface DataCheckUnique {
  user: IdentifyUser
  ownId?: Id
  meta?: {
    noErrMsg: boolean
  }
}

export interface DataCheckUniqueWithAction {
  action: 'checkUnique'
  value: IdentifyUser
  ownId?: Id
  meta?: {
    noErrMsg: boolean
  }
}

export interface DataIdentityChange extends WithNotifierOptions {
  changes: Record<string, any>
  password: string
  user: IdentifyUser
}

export interface DataIdentityChangeWithAction extends WithNotifierOptions {
  action: 'identityChange'
  value: {
    changes: Record<string, any>
    password: string
    user: IdentifyUser
  }
}

export interface DataPasswordChange extends WithNotifierOptions {
  oldPassword: string
  password: string
  user: IdentifyUser
}

export interface DataPasswordChangeWithAction extends WithNotifierOptions {
  action: 'passwordChange'
  value: {
    oldPassword: string
    password: string
    user: IdentifyUser
  }
}

export interface DataResendVerifySignup extends WithNotifierOptions {
  user: IdentifyUser
}

export interface DataResendVerifySignupWithAction extends WithNotifierOptions {
  action: 'resendVerifySignup'
  value: IdentifyUser
}

export interface DataResetPwdLong extends WithNotifierOptions {
  password: string
  token: string
}

export interface DataResetPwdLongWithAction extends WithNotifierOptions {
  action: 'resetPwdLong'
  value: {
    password: string
    token: string
  }
}

export interface DataResetPwdShort extends WithNotifierOptions {
  password: string
  token: string
  user: IdentifyUser
}

export interface DataResetPwdShortWithAction extends WithNotifierOptions {
  action: 'resetPwdShort'
  value: {
    password: string
    token: string
    user: IdentifyUser
  }
}

export interface DataSendResetPwd extends WithNotifierOptions {
  user: IdentifyUser
}

export interface DataSendResetPwdWithAction extends WithNotifierOptions {
  action: 'sendResetPwd'
  value: IdentifyUser
}

export interface DataVerifySignupLong extends WithNotifierOptions {
  token: string
}

export interface DataVerifySignupLongWithAction extends WithNotifierOptions {
  action: 'verifySignupLong'
  value: string
}

export interface DataVerifySignupSetPasswordLong extends WithNotifierOptions {
  password: string
  token: string
}

export interface DataVerifySignupSetPasswordLongWithAction extends WithNotifierOptions {
  action: 'verifySignupSetPasswordLong'
  value: {
    password: string
    token: string
  }
}

export interface DataVerifySignupSetPasswordShort extends WithNotifierOptions {
  password: string
  token: string
  user: IdentifyUser
}

export interface DataVerifySignupSetPasswordShortWithAction extends WithNotifierOptions {
  action: 'verifySignupSetPasswordShort'
  value: {
    password: string
    token: string
    user: IdentifyUser
  }
}

export interface DataVerifySignupShort extends WithNotifierOptions {
  token: string
  user: IdentifyUser
}

export interface DataVerifySignupShortWithAction extends WithNotifierOptions {
  action: 'verifySignupShort'
  value: {
    token: string
    user: IdentifyUser
  }
}

export interface DataOptions {
  action: 'options'
}

//#endregion

export interface ClientOptions {
  path: string
}
