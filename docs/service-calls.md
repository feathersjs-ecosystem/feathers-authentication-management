---
title: Service Calls
---

# {{ $frontmatter.title }}

The `feathers-authentication-management` service can be called using various methods. These can be external calls from the client as well as internal calls within the server. On client side, you can use the [Feathers client](https://docs.feathersjs.com/api/client.html), plain and simple HTTP requests, or any other request library your frontend framework provides.

The service may be called using

- Direct Feathers service calls,
- HTTP requests on the Feathers API,
- Provided service wrappers (see last section).

## Comparison of Old with New Service Calls

In the first versions of this service, the data objects of the service requests contained the name of the action, for example `'sendResetPwd'` in case of a password reset request:

```js
app.service("authManagement").create({
  action: "sendResetPwd",
  value: {
    email: "me@example.com",
  },
});
```

The latest versions offer a new method, where the name of the action is added to the path of the service endpoint:

```js
app.service("authManagement/send-reset-password").create({
  value: {
    email: "me@example.com",
  },
});
```

For the reference, in the following table the new service endpoints are compared with the old action names:

| New Service Endpoint                | Old Action Name                          |
| ----------------------------------- | ---------------------------------------- |
| `/check-unique`                     | `action: 'checkUnique'`                  |
| `/identity-change`                  | `action: 'identityChange'`               |
| `/password-change`                  | `action: 'passwordChange'`               |
| `/resend-verify-signup`             | `action: 'resendVerifySignup'`           |
| `/reset-password-long`              | `action: 'resetPwdLong'`                 |
| `/reset-password-short`             | `action: 'resetPwdShort'`                |
| `/send-reset-password`              | `action: 'sendResetPwd'`                 |
| `/verify-signup-long`               | `action: 'verifySignupLong'`             |
| `/verify-signup-set-password-long`  | `action: 'verifySignupSetPasswordLong'`  |
| `/verify-signup-set-password-short` | `action: 'verifySignupSetPasswordShort'` |
| `//verify-signup-short`             | `action: 'verifySignupShort'`            |

## List of Service Calls

Only the new service endpoints are used in the following list of all service calls.
All service calls return a promise.

### checkUnique

Checks if the properties are unique in the users items.

```js
app.service('authManagement/check-unique').create({
  value: identifyUser, // e. g. {email: 'a@a.com'} or  {username: 'jane'}. Props with null or undefined are ignored.
  ownId, // Excludes user with ownId from the search
  meta: { noErrMsg } // if return an error.message if not unique
}
```

Returns `null` if the properties are unique (= already existing) in the users items. Otherwise rejects with `BadRequest`.

### identityChange

Changes the communication address of a user, e. g. the e-mail address or a phone number.

```js
app.service('authManagement/identity-change').create({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    password, // current password for verification
    changes, // {email: 'a@a.com'} or {email: 'a@a.com', cellphone: '+1-800-555-1212'}
  },
}
```

Returns the user object or rejects with `BadRequest`.

### passwordChange

Changes the password of a user.

```js
app.service('authManagement/password-change').create({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    oldPassword, // old password for verification
    password, // new password
  },
}
```

Returns the user object or rejects with `BadRequest`.

### resendVerifySignup

Recreates a long and/or short verification token, stores it to the user item, and triggers the notifier function to send the token to the user.

```js
app.service('authManagement/resend-verify-signup').create({
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions: {}, // options passed to options.notifier, e.g. {preferredComm: 'cellphone'}
}
```

Returns the user object or rejects with `BadRequest`.

### resetPwdLong

Stores a new password. Requires a valid long `resetToken`.

```js
app.service('authManagement/reset-password-long').create({
   value: {
    token, // compares to resetToken
    password, // new password
  },
}
```

Returns the user object or rejects with `BadRequest`.

### resetPwdShort

Stores a new password. Requires a valid short `resetShortToken` and a property of the user object to identify the user.

```js
app.service('authManagement/reset-password-short').create({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .resetShortToken
    password, // new password
  },
}
```

Returns the user object or rejects with `BadRequest`.

### sendResetPwd

Creates a short and/or long password reset token, stores it to the user item, and triggers the notifier function to send the token to the user.

```js
app.service('authManagement/send-reset-password').create({
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions, // options passed to options.notifier, e.g. {preferredComm: 'email'}
}
```

Returns the user object or rejects with `BadRequest`.

### verifySignupLong

Verifies a given long verification token.

```js
app.service('authManagement/verify-signup-long').create({
  value: verifyToken, // compares to .verifyToken
}
```

Returns the user object or rejects with `BadRequest`.

### verifySignupShort

Verifies a given short verification token.

```js
app.service('authManagement/verify-signup-short').create({
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
  },
}
```

Returns the user object or rejects with `BadRequest`.

### verifySignupSetPasswordLong

This is a combination of `verifySignupLong` and `resetPwdLong`: Verifies a given long verification token and stores the new password.

```js
app.service('authManagement/verify-signup-set-password-long').create({
  value: {
    token, // compares to .verifyToken
    password, // new password
  },
}
```

Returns the user object or rejects with `BadRequest`.

### verifySignupSetPasswordShort

This is a combination of `verifySignupShort` and `resetPwdShort`: Verifies a given short verification token and stores the new password.

```js
app.service('authManagement/verify-signup-set-password-short').create({
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
    password, // new password
  },
}
```

Returns the user object or rejects with `BadRequest`.

## Provided Service Wrappers

The wrappers return a Promise.

```javascript
<script src=".../feathers-authentication-management/lib/client.js"></script>
  or
import AuthManagement from 'feathers-authentication-management/lib/client';
const app = feathers() ...
const authManagement = new AuthManagement(app);

// check props are unique in the users items
authManagement.checkUnique(identifyUser, ownId, ifErrMsg)

// resend sign up verification notification
authManagement.resendVerifySignup(identifyUser, notifierOptions)

// sign up or identityChange verification with long token
authManagement.verifySignupLong(verifyToken)

// sign up or identityChange verification with short token
authManagement.verifySignupShort(verifyShortToken, identifyUser)

// sign up or identityChange verification with long token
authManagement.verifySignupSetPasswordLong(verifyToken, password)

// sign up or identityChange verification with short token
authManagement.verifySignupSetPasswordShort(verifyShortToken, identifyUser, password)

// send forgotten password notification
authManagement.sendResetPwd(identifyUser, notifierOptions)

// forgotten password verification with long token
authManagement.resetPwdLong(resetToken, password)

// forgotten password verification with short token
authManagement.resetPwdShort(resetShortToken, identifyUser, password)

// change password
authManagement.passwordChange(oldPassword, password, identifyUser)

// change identity
authManagement.identityChange(password, changesIdentifyUser, identifyUser)

// Authenticate user and log on if user is verified. v0.x only.
authManagement.authenticate(email, password)
```
