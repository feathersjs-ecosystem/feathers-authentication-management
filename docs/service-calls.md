---
title: Service Calls
---

# {{ $frontmatter.title }}

The `feathers-authentication-management` service methods can be called using various ways. These can be external calls from the client as well as internal calls within the server. On client side, you can use the [Feathers client](https://docs.feathersjs.com/api/client.html), plain and simple HTTP requests, or any other request library your frontend framework provides.

The service may be called using

- Direct Feathers service calls,
- HTTP requests on the Feathers API,
- Provided service wrappers (see last section).

## Comparison of Old with New Service Calls

There are three ways of calling a method:
1. Main service as `AuthenticationManagementService` with `create` and `action`
2. Separate services (e.g. `SendResetPwdService`) with `create`
3. Main service as `AuthenticationManagementService` with custom method (e.g. `sendResetPassword`)

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service("auth-management").create({
  action: "sendResetPwd",
  value: {
    email: "me@example.com",
  },
});
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { SendResetPwdService } = require('feathers-authentication-management');

app.use("auth-management/send-reset-password", new SendResetPwdService(app));

app.service("auth-management/send-reset-password").create({
  value: {
    email: "me@example.com",
  },
});
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service("auth-management").sendResetPassword({
  value: {
    email: "me@example.com",
  },
});
```

  </CodeGroupItem>
  
</CodeGroup>

## List of Service Calls

All service calls return a promise.

### checkUnique

Checks if the properties are unique in the users items.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'checkUnique',
  value: identifyUser, // e. g. {email: 'a@a.com'} or  {username: 'jane'}. Props with null or undefined are ignored.
  ownId, // Excludes user with ownId from the search
  meta: { noErrMsg } // if return an error.message if not unique
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { CheckUniqueService } = require('feathers-authentication-management');

app.use("auth-management/check-unique", new CheckUniqueService(app));

app.service('auth-management/check-unique').create({
  value: identifyUser, // e. g. {email: 'a@a.com'} or  {username: 'jane'}. Props with null or undefined are ignored.
  ownId, // Excludes user with ownId from the search
  meta: { noErrMsg } // if return an error.message if not unique
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').checkUnique({
  value: identifyUser, // e. g. {email: 'a@a.com'} or  {username: 'jane'}. Props with null or undefined are ignored.
  ownId, // Excludes user with ownId from the search
  meta: { noErrMsg } // if return an error.message if not unique
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns `null` if the properties are unique (= already existing) in the users items. Otherwise rejects with `BadRequest`.

### identityChange

Changes the communication address of a user, e. g. the e-mail address or a phone number.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'identityChange',
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    password, // current password for verification
    changes, // {email: 'a@a.com'} or {email: 'a@a.com', cellphone: '+1-800-555-1212'}
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { IdentityChangeService } = require('feathers-authentication-management');

app.use("auth-management/identity-change", new IdentityChangeService(app));

app.service('auth-management/identity-change').create({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    password, // current password for verification
    changes, // {email: 'a@a.com'} or {email: 'a@a.com', cellphone: '+1-800-555-1212'}
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').identityChange({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    password, // current password for verification
    changes, // {email: 'a@a.com'} or {email: 'a@a.com', cellphone: '+1-800-555-1212'}
  },
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### passwordChange

Changes the password of a user.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'passwordChange',
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    oldPassword, // old password for verification
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { PasswordChangeService } = require('feathers-authentication-management');

app.use("auth-management/password-change", new PasswordChangeService(app));

app.service('auth-management/password-change').create({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    oldPassword, // old password for verification
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').passwordChange({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    oldPassword, // old password for verification
    password, // new password
  },
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### resendVerifySignup

Recreates a long and/or short verification token, stores it to the user item, and triggers the notifier function to send the token to the user.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'resendVerifySignup',
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions: {}, // options passed to options.notifier
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { ResendVerifySignupService } = require('feathers-authentication-management');

app.use('auth-management/resend-verify-signup', new ResendVerifySignupService(app));

app.service('auth-management/resend-verify-signup').create({
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions: {}, // options passed to options.notifier
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').resendVerifySignup({
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions: {}, // options passed to options.notifier
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### resetPwdLong

Stores a new password. Requires a valid long `resetToken`.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'resetPwdLong',
  value: {
    token, // compares to resetToken
    password, // new password
  },
}


```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { ResetPwdLongService } = require('feathers-authentication-management');

app.use('auth-management/reset-pwd-long', new ResetPwdLongService(app));

app.service('auth-management/reset-pwd-long').create({
  value: {
    token, // compares to resetToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').resetPasswordLong({
  value: {
    token, // compares to resetToken
    password, // new password
  },
}

```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### resetPwdShort

Stores a new password. Requires a valid short `resetShortToken` and a property of the user object to identify the user.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  value: {
    action: 'resetPwdShort',
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .resetShortToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { ResetPwdShortService } = require('feathers-authentication-management');

app.use('auth-management/reset-password-short', new ResetPwdShortService(app));

app.service('auth-management/reset-password-short').create({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .resetShortToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').resetPasswordShort({
  value: {
    user: identifyUser, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .resetShortToken
    password, // new password
  },
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### sendResetPwd

Creates a short and/or long password reset token, stores it to the user item, and triggers the notifier function to send the token to the user.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'sendResetPwd',
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions, // options passed to options.notifier
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { SendResetPwdService } = require('feathers-authentication-management');

app.use("auth-management/send-reset-password", new SendResetPwdService(app));

app.service('auth-management/send-reset-password').create({
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions, // options passed to options.notifier
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').sendResetPassword({
  value: identifyUser, // {email}, {token: verifyToken}
  notifierOptions, // options passed to options.notifier
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### verifySignupLong

Verifies a given long verification token.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'verifySignupLong',
  value: verifyToken, // compares to .verifyToken
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { VerifySignupLongService } = require('feathers-authentication-management');

app.use("auth-management/verify-signup-long", new VerifySignupLongService(app));

app.service('auth-management/verify-signup-long').create({
  value: verifyToken, // compares to .verifyToken
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').verifySignupLong({
  value: verifyToken, // compares to .verifyToken
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### verifySignupShort

Verifies a given short verification token.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'verifySignupShort',
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
  },
}

```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { VerifySignupShortService } = require('feathers-authentication-management');

app.use("auth-management/verify-signup-short", new VerifySignupShortService(app));

app.service('auth-management/verify-signup-short').create({
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').verifySignupShort({
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
  },
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### verifySignupSetPasswordLong

This is a combination of `verifySignupLong` and `resetPwdLong`: Verifies a given long verification token and stores the new password.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'verifySignupSetPasswordLong',
  value: {
    token, // compares to .verifyToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { VerifySignupSetPasswordLongService } = require('feathers-authentication-management');

app.use("auth-management/verify-signup-set-password-long", new VerifySignupSetPasswordLongService(app));

app.service('auth-management/verify-signup-set-password-long').create({
  value: {
    token, // compares to .verifyToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').verifySignupSetPasswordLong({
  value: {
    token, // compares to .verifyToken
    password, // new password
  },
}
```

  </CodeGroupItem>
  
</CodeGroup>

Returns the user object or rejects with `BadRequest`.

### verifySignupSetPasswordShort

This is a combination of `verifySignupShort` and `resetPwdShort`: Verifies a given short verification token and stores the new password.

<CodeGroup>

  <CodeGroupItem title="Main Service" active>

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').create({
  action: 'verifySignupSetPasswordShort',
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Separate Service">

```js
const { VerifySignupSetPasswordShortService } = require('feathers-authentication-management');

app.use("auth-management/verify-signup-set-password-short", new VerifySignupSetPasswordShortService(app));

app.service('auth-management/verify-signup-set-password-short').create({
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
    password, // new password
  },
}
```

  </CodeGroupItem>

  <CodeGroupItem title="Custom Method">

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');

app.use('auth-management', new AuthenticationManagementService(app));

app.service('auth-management').verifySignupSetPasswordShort({
  value: {
    user, // identify user, e.g. {email: 'a@a.com'}. See options.identifyUserProps.
    token, // compares to .verifyShortToken
    password, // new password
  },
}
```

  </CodeGroupItem>
  
</CodeGroup>

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
