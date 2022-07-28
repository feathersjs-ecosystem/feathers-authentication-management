---
title: Configuration
---

# {{ $frontmatter.title }}

The `feathers-authentication-management` service is configured at several positions of a Feathers application:

1. Attaching of the service with options to the Feathers app.

2. Extension of the user model with new fields required by the service.

3. Extension of the create hooks in the users service.

4. Implementation of a custom notifier function to send e-mails, SMS, or use any other communication channel configured in your application.

## Service Options

The `feathers-authentication-management` service is added to the Feathers app with

```js
const {
  AuthenticationManagementService,
} = require("feathers-authentication-management");

app.use("/auth-management", new AuthenticationManagementService(app, options));
```

Possible `options` are:

| Field                   | Field Type                              | Description                                                                         |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| `service`               | `string`                                  | The path of the service for user items, e.g. `/users` (default) or `/organization`. |
| `skipIsVerifiedCheck`   | `boolean`                                 | If `false` (default) it is impossible to reset passwords even if e-mail is not verified. |
| `sanitizeUserForClient` | User object                             | By default, **THE USER OBJECT IS IN THE RESPONSE** e. g. of a password reset request. To reply with empty object use `sanitizeUserForClient: () => ({})`. |
| `notifier`              | `function(type, user, notifierOptions)` | Returns a Promise with the [notifier function](#notifier-function). |
| `longTokenLen`          | `number`                                  | Half the length of the long token. Default is 15, giving tokens of 30 characters length. |
| `shortTokenLen`         | `number`                                  | Length of short token (default: 6). |
| `shortTokenDigits`      | `boolean`                                 | If `true` (default) short tokens contain only digits. Otherwise also characters. |
| `delay`                 | `number`                                  | Lifetime for e-mail verification tokens in ms. Default is `5*24*60*60*1000 = 432000000` *(5 days)*. |
| `resetDelay`            | `number`                                  | Lifetime for password reset tokens in ms. Default is `2*60*60*1000 = 7200000` *(2 hours)*. |
| `resetAttempts`         | `number`                                  | Amount of times a user can submit an invalid token before the current token gets removed from the database. Default is 0. |
| `reuseResetToken`       | `boolean`                                 | Use the same reset token if the user resets password twice in a short period. In this case token is not hashed in the database. Default is `false`. |
| `identifyUserProps`     | `string`                                  | Property names in the `user` item which uniquely identify the user, e.g. `['username', 'email', 'cellphone']`. The default is `['email']`. Only these properties may be changed with verification by the service. At least one of these properties must be provided whenever a short token is used, as the short token alone is too susceptible to brute force attack. |
| `passwordField`         | `string`                                  | Property name of the password field. Default is `password`. |
| `passParams`         | `(params) => Params`                       | Pass params from the `f-a-m` service to `/users` service. |

## User Model Fields

The user model has to be extended with new fields that are used by `feathers-authentication-management`. Not all of these fields are required. Which fields are necessary depend strongly on your use case and the communication channel. Possible fields are:

| Field              | Field Type       | Description                                                           |
| ------------------ | ---------------- | --------------------------------------------------------------------- |
| `isVerified`       | `boolean`        | Indicates if the user's e-mail address has been verified.             |
| `verifyToken`      | `string`         | A long verification token generated for verification e-mails.         |
| `verifyShortToken` | `string`         | A short verification token generated e. g. for verification SMS.      |
| `verifyExpires`    | `Date \| number` | Expiration date of the verification token.                            |
| `verifyChanges`    | `string[]`       | An array that tracks e. g. the change of an e-mail address.           |
| `resetToken`       | `string`         | A long reset token generated for password reset e-mails.              |
| `resetShortToken`  | `string`         | A short reset token generated e. g. for password reset SMS.           |
| `resetExpires`     | `Date \| number` | Expiration date of the reset token.                                   |
| `resetAttempts`    | `number`         | Amount of incorrect reset submissions left before token invalidation. |

All necessary fields have to be added to the `users` database table and to the `users` model as well.

## Service Hooks

The `feathers-authentication-management` service does not handle creation of a new user account nor the sending of the initial sign up verification notification. Instead hooks are provided to be used with the `users` service `create` method. If you set a service path other than the default of `'/auth-management'`, the custom path name must be passed into the hook.

### addVerification

This hook is made exclusively for the `/users` service. Creates tokens and sets default `authManagement` data for users.

| before | after | methods               | multi | details    |
| ------ | ----- | --------------------- | ----- | ---------- |
| yes    | no    | create, patch, update | yes   | [source](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/src/hooks/add-verification.ts) |

- **Arguments:**
  - `path?: string`

| Argument |   Type   | Default          | Description                                        |
| -------- | :------: | ---------------- | -------------------------------------------------- |
| `path`   | `string` | `authManagement` | The service path for the `authManagement` service. |

- **Example:**

```javascript
// src/services/users/users.hooks.js
const { 
  hashPassword, 
  protect 
} = require("@feathersjs/authentication-local").hooks;
const { 
  addVerification, 
  removeVerification 
} = require("feathers-authentication-management");
const authNotifier = require("path-to/notifier");

const {
  disallow,
  iff,
  isProvider,
  preventChanges,
} = require("feathers-hooks-common");

const sendVerify = () => {
  return (context) => {
    const notifier = authNotifier(context.app);

    const users = Array.isArray(context.result) 
      ? context.result
      : [context.result];

    // Send an e-mail/SMS with the verification token
    await Promise.all(
      users.map(async user => notifier("resendVerifySignup", user))
    )
  };
}

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt")],
    get: [authenticate("jwt")],
    create: [
      // authenticate("jwt") // enable this, if you have a closed app
      hashPassword("password"),
      addVerification("auth-management"), // adds .isVerified, .verifyExpires, .verifyToken, .verifyChanges
    ],
    update: [
      disallow("external"),
      authenticate("jwt"),
      hashPassword("password"),
    ],
    patch: [
      authenticate("jwt"),
      iff(
        isProvider("external"),
        preventChanges(
          true,
          "email",
          "isVerified",
          "resetExpires"
          "resetShortToken",
          "resetToken",
          "verifyChanges",
          "verifyExpires",
          "verifyShortToken",
          "verifyToken",
        ),
        hashPassword("password")
      ),
    ],
    remove: [authenticate("jwt"), hashPassword("password")],
  },
  after: {
    all: [],
    find: [protect("password")],
    get: [protect("password")],
    create: [
      protect("password"),
      sendVerify(),
      removeVerification(), // removes verification/reset fields other than .isVerified from the response
    ],
    update: [protect("password")],
    patch: [protect("password")],
    remove: [protect("password")],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
```

### isVerified

Throws, if requesting user is not verified (`params.user.isVerified`) and passes otherwise.

| before | after | methods | multi | details    |
| ------ | ----- | ------- | ----- | ---------- |
| yes    | no    | all     | yes   | [source](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/src/hooks/is-verified.ts) |

- **Arguments:**

  - _none_

- **Example:**

```js
const { authenticate } = require("@feathersjs/authentication").hooks;
const { isVerified } = require("feathers-authentication-management");

module.exports = {
  before: {
    all: [authenticate("jwt"), isVerified()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
```

### removeVerification

This hook is made exclusively for the `/users` service. It deletes data on user items for external requests that was added for `feathers-authentication-management` to work. It is similar to the `protect('password')` hook from `@feathersjs/authentication-local`.
It deletes `verifyExpires`, `resetExpires` and `verifyChanges` and if `ifReturnToken: true` it also deletes `verifyToken`, `verifyShortToken`, `resetToken` and `resetShortToken`.

| before | after | methods | multi | details    |
| ------ | ----- | ------- | ----- | ---------- |
| no     | yes   | all     | yes   | [source](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/src/hooks/remove-verification.ts) |

- **Arguments:**
  - `ifReturnToken?: boolean`

| Argument        |   Type    | Default | Description |
| --------------- | :-------: | ------- | ----------- |
| `ifReturnToken` | `boolean` | `false` | removes     |

- **Example:**
  See the example under [addVerification](./configuration#addverification)

## Notifier Function

The notifier function is passed to `feathers-authentication-management` as a parameter. It handles the sending of any notification depending on the action.

It returns a Promise and is called with three parameters:

- `type`: the name of the action:

  - `resendVerifySignup` from resendVerifySignup API call
  - `verifySignup` from verifySignupLong and verifySignupShort API calls
  - `verifySignupSetPassword` from verifySignupSetPasswordLong and verifySignupSetPasswordShort API calls
  - `sendResetPwd` from sendResetPwd API call
  - `resetPwd` from resetPwdLong and resetPwdShort API calls
  - `passwordChange` from passwordChange API call
  - `identityChange` from identityChange API call

- `user`: the user object, containing information such as user name or e-mail address.

- `notifierOptions`: notifierOptions option from resendVerifySignup and sendResetPwd API calls
