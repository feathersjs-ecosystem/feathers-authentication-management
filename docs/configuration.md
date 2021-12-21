---
title: Configuration
---

# {{ $frontmatter.title }}

## Service Options

The `feathers-authentication-management` service is added to the Feathers app with

```js
app.configure(authManagement({ options }, { docs }));
```

Possible `options` are:

| Field                   | Field Type                              | Description                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service`               | String                                  | The path of the service for user items, e.g. `/users` (default) or `/organization`.                                                                                                                                                                                                                                                                                    |
| `path`                  | String                                  | The path to associate with this service. Default `authManagement`.                                                                                                                                                                                                                                                                                                     |
| `skipIsVerifiedCheck`   | Boolean                                 | If `false` (default) it is impossible to reset password if email is not verified.                                                                                                                                                                                                                                                                                      |
| `sanitizeUserForClient` | User object                             | By default, **THE USER OBJECT IS IN THE RESPONSE** of e. g.a password reset request. To reply with empty object use `sanitizeUserForClient: () => ({})`                                                                                                                                                                                                                |
| `notifier`              | `function(type, user, notifierOptions)` | Returns a Promise with the [notifier function](#notifier-function)                                                                                                                                                                                                                                                                                                     |
| `longTokenLen`          | Number                                  | Half the length of the long token. Default is 15, giving tokens of 30 characters length.                                                                                                                                                                                                                                                                               |
| `shortTokenLen`         | Number                                  | Length of short token (default: 6).                                                                                                                                                                                                                                                                                                                                    |
| `shortTokenDigits`      | Boolean                                 | If short token contain only digits (`true`) or also characters (`false`).                                                                                                                                                                                                                                                                                              |
| `delay`                 | Number                                  | Lifetime for e-mail verification tokens in ms. Default is 432000000 = 5 days.                                                                                                                                                                                                                                                                                          |
| `resetDelay`            | Number                                  | Lifetime for password reset token in ms. Default is 7200000 = 2 hours.                                                                                                                                                                                                                                                                                                 |
| `resetAttempts`         | Number                                  | Amount of times a user can submit an invalid token before the current token gets removed from the database. Default is 0.                                                                                                                                                                                                                                              |
| `reuseResetToken`       | Boolean                                 | Use the same reset token if the user resets password twice in a short period. In this case token is not hashed in the database. Default is `false`.                                                                                                                                                                                                                    |
| `identifyUserProps`     | String                                  | Property names in the `user` item which uniquely identify the user, e.g. `['username', 'email', 'cellphone']`. The default is `['email']`. Only these properties may be changed with verification by the service. At least one of these properties must be provided whenever a short token is used, as the short token alone is too susceptible to brute force attack. |
| `passwordField`         | String                                  | Property name of the password field. Default is `password`                                                                                                                                                                                                                                                                                                             |

The `docs` parameter is the representation of the service swagger documentation. Default is `{}`.

## User Model Fields

The user model has to be extended with several fields that are used by `feathers-authentication-management` methods. Which fields are necessary depend strongly on the use case and the used transport mechanism. Possible fields are:

| Field              | Field Type   | Description                                                           |
| ------------------ | ------------ | --------------------------------------------------------------------- |
| `isVerified`       | Boolean      | Indicates if the user's e-mail address has been verified.             |
| `verifyToken`      | String       | A long verification token generated for verification e-mails.         |
| `verifyExpires`    | Date\|Number | Expiration date of the verification token.                            |
| `verifyChanges`    | String[]     | An array that tracks e.g. the change of an e-mail address.            |
| `resetToken`       | String       | A long reset token generated for password reset e-mails.              |
| `resetExpires`     | Date\|Number | Expiration date of the reset token.                                   |
| `resetAttempts`    | Number       | Amount of incorrect reset submissions left before token invalidation. |
| `verifyShortToken` | String       | A short verification token generated e. g. for verification SMS       |
| `resetShortToken`  | String       | A short reset token generated e. g. for password reset SMS.           |
| `preferredComm`    | String       | The preferred way to notify the user. One of `identifyUserProps`      |

All necessary fields have to be added to the `users` database table and to the `users` model.

## Service Hooks

The `feathers-authentication-management` service does not itself handle creation of a new user account nor the sending of the initial sign up verification request. Instead hooks are provided for you to use with the `users` service `create` method. If you set a service path other than the default of `'authManagement'`, the custom path name must be passed into the hook.

### addVerification

This hook is made exclusively for the `/users` service. Creates tokens and sets default `authManagement` data for users.

| before | after | methods               | multi | details    |
| ------ | ----- | --------------------- | ----- | ---------- |
| yes    | no    | create, patch, update | no    | [source]() |

- **Arguments:**
  - `path?: string`

| Argument |   Type   | Default          | Description                                        |
| -------- | :------: | ---------------- | -------------------------------------------------- |
| `path`   | `string` | `authManagement` | The service path for the `authManagement` service. |

- **Example:**

```javascript
// src/services/users/users.hooks.js
const { hashPassword, protect } =
  require("@feathersjs/authentication-local").hooks;

const { addVerification, removeVerification } =
  require("feathers-authentication-management").hooks;

const {
  disallow,
  iff,
  isProvider,
  preventChanges,
} = require("feathers-hooks-common");

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt")],
    get: [authenticate("jwt")],
    create: [
      hashPassword("password"),
      addVerification(), // adds .isVerified, .verifyExpires, .verifyToken, .verifyChanges
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
          "email",
          "isVerified",
          "verifyToken",
          "verifyShortToken",
          "verifyExpires",
          "verifyChanges",
          "resetToken",
          "resetShortToken",
          "resetExpires"
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
      aHookToEmailYourVerification(),
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
| yes    | no    | all     | yes   | [source]() |

- **Arguments:**

  - _none_

- **Example:**

```js
const { authenticate } = require("feathers-authentication").hooks;
const { isVerified } = require("feathers-authentication-management").hooks;

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
| no     | yes   | all     | yes   | [source]() |

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

## Security

- The user must be authenticated when the short token is used, making the short token less appealing
  as an attack vector.
- The long and short tokens are erased on successful verification and password reset attempts.
  New tokens must be acquired for another attempt.
- API parameters are verified to be strings. If the parameter is an object, the values of its props are
  verified to be strings.
- `options.identifyUserProps` restricts the property names allowed in param objects.
- In order to protect sensitive data, you should set a hook that prevent `PATCH` or `PUT` calls on
  authentication-management related properties:

```javascript
// users.hooks.js
before: {
  update: [
    iff(isProvider('external'), preventChanges(
      'isVerified',
      'verifyToken',
      'verifyShortToken',
      'verifyExpires',
      'verifyChanges',
      'resetToken',
      'resetShortToken',
      'resetExpires'
    )),
  ],
  patch: [
    iff(isProvider('external'), preventChanges(
      'isVerified',
      'verifyToken',
      'verifyShortToken',
      'verifyExpires',
      'verifyChanges',
      'resetToken',
      'resetShortToken',
      'resetExpires'
    )),
  ],
},
```
