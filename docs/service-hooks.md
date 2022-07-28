---
title: Service Hooks
---

# {{ $frontmatter.title }}

The `feathers-authentication-management` service does not handle creation of a new user account nor the sending of the initial sign up verification notification. Instead hooks are provided to be used with the `users` service `create` method. If you set a service path other than the default of `'/authManagement'`, the custom path name must be passed into the hook.

### addVerification

This hook is made exclusively for the `/users` service. Creates tokens and sets default `authManagement` data for users.

| before | after | methods               | multi | details    |
| ------ | ----- | --------------------- | ----- | ---------- |
| yes    | no    | create, patch, update | no    | [source](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/src/hooks/add-verification.ts) |

- **Arguments:**
  - `path?: string`

| Argument |   Type   | Default          | Description                                                                                                                      |
| -------- | :------: | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `path`   | `string` | `authManagement` | The path of the service. This is required, if the service is configured with a different path than the default `authManagement`. |

- **Example:**

```javascript
// src/services/users/users.hooks.js
const { authenticate } = require("@feathersjs/authentication").hooks;
const { hashPassword, protect } = require("@feathersjs/authentication-local").hooks;
const { addVerification, removeVerification } = require("feathers-authentication-management");
const authNotifier = require("./path-to/your/notifier");

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
      (context) => {
        // Send an e-mail/SMS with the verification token
        authNotifier(context.app).notifier("verifySignupLong", context.result);
      },
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

Throws, if requesting user is not verified (`params.user.isVerified`) and passes otherwise. Please make sure to call `authenticate('jwt')` before.

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
