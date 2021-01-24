import { Application, Id } from '@feathersjs/feathers';

export type HookResult = User | User[] | { data: User | User[], total: number };

export interface VerifyChanges {
  [key: string]: unknown
  [key: number]: unknown
}

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
  [key: string]: unknown
  [key: number]: unknown
}

// TODO: explicit
export interface Tokens {
  resetToken?: string
  resetShortToken?: string
  verifyShortToken?: string
  verifyToken?: string
}

export interface IdentifyUser {
  [key: string]: string
  [key: number]: string
}

export type Notifier = (type: string, user: Partial<User>, notifierOptions: Record<string, unknown>) => unknown;
export type SanitizeUserForClient = (user: Partial<User>) => SanitizedUser;

export type SanitizedUser = Partial<User>;

export type NotificationType = 'resendVerifySignup' | 'verifySignup' | 'verifySignupSetPassword' | 'sendResetPwd' | 'resetPwd' | 'passwordChange' | 'identityChange';

export type AuthenticationManagementOptionsDefault =
  Pick<AuthenticationManagementOptions,
  'app' |
  'service' |
  'path' |
  'notifier' |
  'longTokenLen' |
  'shortTokenLen' |
  'shortTokenDigits' |
  'resetDelay' |
  'delay' |
  'resetAttempts' |
  'reuseResetToken' |
  'identifyUserProps' |
  'sanitizeUserForClient' |
  'skipIsVerifiedCheck' |
  'passwordField'> & { app: null };

export interface AuthenticationManagementOptions {
  app: Application
  service: string
  path: string
  skipIsVerifiedCheck: boolean
  notifier: (type: NotificationType, user: Omit<User, 'password'>, notifierOptions: unknown) => Promise<void>
  longTokenLen: number
  shortTokenLen: number
  shortTokenDigits: boolean
  resetDelay: number
  delay: number
  resetAttempts: number
  reuseResetToken: boolean
  identifyUserProps: string[]
  sanitizeUserForClient: (user: User) => Partial<User>
  passwordField: string
  // identifyUser: IdentifyUser // TODO ?
}

export interface AuthenticationManagementClient {
  checkUnique: (identifyUser: IdentifyUser, ownId: Id, ifErrMsg: boolean) => Promise<void>
  resendVerifySignup: (identifyUser: IdentifyUser, notifierOptions: Record<string, unknown>) => Promise<void>
  verifySignupLong: (verifyToken: string) => Promise<void>
  verifySignupShort: (verifyToken: string, identifyUser: IdentifyUser) => Promise<void>
  sendResetPwd: (IdentifyUser: IdentifyUser, notifierOptions: Record<string, unknown>) => Promise<void>
  resetPwdLong: (resetToken: string, password: string) => Promise<void>
  resetPwdShort: (resetShortToken: string, identifyUser: IdentifyUser, password: string) => Promise<void>
  passwordChange: (oldPassword: string, password: string, identifyUser: IdentifyUser) => Promise<void>
  identityChange: (password: string, changesIdentifyUser: Record<string, unknown>, identifyUser: IdentifyUser) => Promise<void>
  authenticate: (email: string, password: string, cb?: (err: Error | null, user?: Partial<User>) => void) => Promise<unknown>
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
  value: IdentifyUser
  ownId?: Id
  meta?: {
    noErrMsg: boolean
  }
}

export interface DataCheckUniqueWithAction extends DataCheckUnique {
  action: 'checkUnique'
}

// TODO: notifierOptions
export interface DataResendVerifySignup {
  value: IdentifyUser
  notifierOptions?: Record<string, unknown>
}

export interface DataResendVerifySignupWithAction extends DataResendVerifySignup {
  action: 'resendVerifySignup'
}

export interface DataVerifySignupLong {
  value: string
  notifierOptions?: Record<string, unknown>
}

export interface DataVerifySignupLongWithAction extends DataVerifySignupLong {
  action: 'verifySignupLong'
}

export interface DataVerifySignupShort {
  value: {
    token: string
    user: IdentifyUser
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataVerifySignupShortWithAction extends DataVerifySignupShort {
  action: 'verifySignupShort'
}

export interface DataVerifySignupSetPasswordLong {
  value: {
    token: string
    password: string
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataVerifySignupSetPasswordLongWithAction extends DataVerifySignupSetPasswordLong {
  action: 'verifySignupSetPasswordLong'
}

export interface DataVerifySignupSetPasswordShort {
  value: {
    token: string
    password: string
    user: IdentifyUser
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataVerifySignupSetPasswordShortWithAction extends DataVerifySignupSetPasswordShort {
  action: 'verifySignupSetPasswordShort'
}

export interface DataSendResetPwd {
  value: IdentifyUser
  notifierOptions?: Record<string, unknown>
}

export interface DataSendResetPwdWithAction extends DataSendResetPwd {
  action: 'sendResetPwd'
}

export interface DataResetPwdLong {
  value: {
    token: string
    password: string
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataResetPwdLongWithAction extends DataResetPwdLong {
  action: 'resetPwdLong'
}

export interface DataResetPwdShort {
  value: {
    token: string
    password: string
    user: IdentifyUser
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataResetPwdShortWithAction extends DataResetPwdShort {
  action: 'resetPwdShort'
}

export interface DataPasswordChange {
  value: {
    user: IdentifyUser
    password: string
    oldPassword: string
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataPasswordChangeWithAction extends DataPasswordChange {
  action: 'passwordChange'
}

export interface DataIdentityChange {
  value: {
    user: IdentifyUser
    password: string
    changes: Record<string, unknown>
  }
  notifierOptions?: Record<string, unknown>
}

export interface DataIdentityChangeWithAction extends DataIdentityChange {
  action: 'identityChange'
}

export interface DataOptions {
  action: 'options'
}

export type VerifySignupOptions = Pick<AuthenticationManagementOptions,
'app' |
'service' |
'notifier' |
'sanitizeUserForClient'>;

export interface VerifySignupWithShortTokenOptions extends VerifySignupOptions {
  identifyUserProps: string[]
}

export type VerifySignupSetPasswordOptions = Pick<AuthenticationManagementOptions,
'app' |
'service' |
'sanitizeUserForClient' |
'notifier' |
'passwordField'>;

export type PasswordChangeOptions = Pick<AuthenticationManagementOptions,
'app' |
'service' |
'identifyUserProps' |
'notifier' |
'sanitizeUserForClient' |
'passwordField'>;

export type VerifySignupSetPasswordWithShortTokenOptions =
VerifySignupSetPasswordOptions & Pick<AuthenticationManagementOptions, 'identifyUserProps'>;

export type ResetPasswordOptions = Pick<AuthenticationManagementOptions,
'app' |
'service' |
'skipIsVerifiedCheck' |
'reuseResetToken' |
'notifier' |
'sanitizeUserForClient' |
'passwordField'>;

export interface ResetPwdWithShortTokenOptions extends ResetPasswordOptions {
  identifyUserProps: string[]
}

export type ResendVerifySignupOptions = Pick<AuthenticationManagementOptions,
'app' |
'service' |
'identifyUserProps' |
'delay' |
'longTokenLen' |
'shortTokenLen' |
'shortTokenDigits' |
'notifier' |
'sanitizeUserForClient'>;

export type IdentityChangeOptions = Pick<AuthenticationManagementOptions,
'app' |
'service' |
'identifyUserProps' |
'delay' |
'longTokenLen' |
'shortTokenLen' |
'shortTokenDigits' |
'notifier' |
'sanitizeUserForClient' |
'passwordField'>;

export type CheckUniqueOptions = Pick<AuthenticationManagementOptions,
'app' |
'service'>;

export type SendResetPwdOptions = Pick<AuthenticationManagementOptions,
'app' |
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
'passwordField'>;
