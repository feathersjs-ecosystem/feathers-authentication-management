import type { Application, Id, Paginated, Query } from '@feathersjs/feathers';

//#region general

export interface User {
  isVerified: boolean
  verifyToken: string
  verifyShortToken: string
  verifyExpires: Date | number // unix
  verifyChanges: Record<string, any>
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
  service: string
  skipIsVerifiedCheck: boolean
  notifier: Notifier
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
}

export type AuthenticationManagementSetupOptions = AuthenticationManagementServiceOptions & { path: string };

export type VerifySignupLongServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'notifier' |
'sanitizeUserForClient'>;

export type VerifySignupOptions = VerifySignupLongServiceOptions & { app: Application };

export type VerifySignupShortServiceOptions = VerifySignupLongServiceOptions & {
  identifyUserProps: string[]
};
export type VerifySignupWithShortTokenOptions = VerifySignupShortServiceOptions & { app: Application };

export type VerifySignupSetPasswordLongServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'sanitizeUserForClient' |
'notifier' |
'passwordField'>;
export type VerifySignupSetPasswordOptions = VerifySignupSetPasswordLongServiceOptions & { app: Application };

export type PasswordChangeServiceOptions = Pick<AuthenticationManagementServiceOptions,
'service' |
'identifyUserProps' |
'notifier' |
'sanitizeUserForClient' |
'passwordField'>;
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
'passwordField'>;
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
'sanitizeUserForClient'>;
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
'passwordField'>;
export type IdentityChangeOptions = IdentityChangeServiceOptions & { app: Application };

export type CheckUniqueServiceOptions = Pick<AuthenticationManagementServiceOptions, 'service'>;
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
'passwordField'>;

export type SendResetPwdOptions = SendResetPwdServiceOptions & { app: Application };

//#endregion

//#region client
export interface AuthenticationManagementClient {
  checkUnique: (identifyUser: IdentifyUser, ownId: Id, ifErrMsg: boolean) => Promise<void>
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
