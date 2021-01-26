---
title: Basic
sidebarDepth: 3
---

# Basic Usage

## Hooks

The service does not itself handle creation of a new user account nor the sending of the initial
sign up verification request.
Instead hooks are provided for you to use with the `users` service `create` method. If you set a service path other than the default of `'authManagement'`, the custom path name must be passed into the hook.

### `verifyHooks.addVerification( path = 'authManagement' )`

```javascript
const verifyHooks = require("feathers-authentication-management").hooks;
// users service
module.exports.before = {
  create: [
    auth.hashPassword(),
    verifyHooks.addVerification(), // adds .isVerified, .verifyExpires, .verifyToken, .verifyChanges
  ],
};
module.exports.after = {
  create: [
    hooks.remove("password"),
    aHookToEmailYourVerification(),
    verifyHooks.removeVerification(), // removes verification/reset fields other than .isVerified from the response
  ],
};
```

### `verifyHooks.isVerified()`

A hook is provided to ensure the user's email addr is verified:

```javascript
const auth = require('feathers-authentication').hooks;
const verifyHooks = require('feathers-authentication-management').hooks;
export.before = {
  create: [
    auth.authenticate('jwt'),
    verifyHooks.isVerified(),
  ]
};
```
