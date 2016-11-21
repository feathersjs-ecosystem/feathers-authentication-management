## feathers-service-verify-reset
Adds sign up verification, forgotten password reset, and other capabilities to local
[`feathers-authentication`](http://docs.feathersjs.com/authentication/local.html).

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-management.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-management)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-management/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-management)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-management/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-management/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-management.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-management)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-management.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-management)

> Adds sign up verification, forgotten password reset, and other capabilities to local
[`feathers-authentication`](http://docs.feathersjs.com/authentication/local.html).

Capabilities:

- Checking that values for fields like email and username are unique within `users` items.
- Hooks for adding a new user.
- Send another email address verification notification, routing through your email or SMS transports.
- Process an email address verification from a URL response.
- Process an email address verification after an SMS notification.
- Send a forgotten password reset notification, routing through your email or SMS transports.
- Process a forgotten password reset from a URL response.
- Process a forgotten password reset from an SMS notification.
- Process password change.
- Process email address change.

User notifications may be sent for:

- Email addr verification request when a new user is created.
- Resending a new email addr verification, e.g. previous verification email was lost or is expired.
- Successful user verification.
- Sending an email to reset the password when the password is forgotten.
- Successful password reset for a forgotten password.
- Manual change of a password.
- The previous email address is notified of a change of email address.

May be used with

- `feathers-client` service calls over websockets or HTTP.
- Client side wrappers for `feathers-client` service calls. 
- HTTP POST calls.
- React's Redux.
- Vue (docs to do)

A 30-char token is generated suitable for URL responses.
(Configurable length.)
This may be embedded in URL links sent by email, SMS or social media
so that clicking the link starts the email address verification or the password reset.

A 6-digit token is also generated suitable for notification by SMS or social media.
(Configurable length, may be alpha-numeric instead.)
This may be manually entered in a UI to start the email address verification or the password reset.

The email verification token has a 5-day expiry (configurable),
while the password reset has a 2 hour expiry (configurable).

Typically your user notifier refers to a property like `user.preferredCommunication: 'email'`
to determine which transport to use for user notification.
However the API allows the UI to be set up to ask the user which transport they prefer this time,
when resending a email address verification and sending a forgotten password reset.

The server does not handle any interactions with the user.
Leaving it a pure API server, lets it be used with both native and browser clients.

## Contents
- [Code example](#codeExample)
- [The Service](#service)
- [Client](#client)
    - [Using Feathers's method calls](#methods)
    - [Provided service wrappers](#wrappers)
    - [HTTP fetch](#fetch)
    - [React's redux](#redux)
        - [Dispatching services](#reduxServices)
        - [Dispatching authentication](#reduxAuth)
    - [Vue 2.0 {to do}](#vue)
- [Hooks](#hooks)
- [Database](#database)
- [Routing](#routing)
- [Security](#security)
- [Configurable](#configurable)
- [Migration from 0.8.0](#migration)
- [Motivation](#motivation)
- [Install package](#install)
- [Install and run example](#exampleRun)
- [Tests](#tests)
    

## <a name="codeExample"> Code Example

The folder `example/` presents a full featured server/browser implementation
whose UI lets you exercise the API.

## <a name="service"> The Service

```javascript
app.configure(authentication)
  .configure(verifyReset({ options }))
  .configure(user);
```

`options` are:
- notifier: `function(type, user, notifierOptions, newEmail, cb)`
   - type: type of notification
     - 'resendVerifySignup'    from resendVerifySignup API call
     - 'verifySignup'          from verifySignupLong and verifySignupShort API calls
     - 'sendResetPwd'          from sendResetPwd API call
     - 'resetPwd'              from resetPwdLong and resetPwdShort API calls
     - 'passwordChange'        from passwordChange API call
     - 'emailChange'           from emailChange API call
   - user: user's item, minus password.
   - notifierOptions: notifierOptions option from resendVerifySignup and sendResetPwd API calls
   - newEmail: the new email address from emailChange API call
- longTokenLen: Half the length of the long token. Default is 15, giving 30-char tokens.
- shortTokenLen: Length of short token. Default is 6.
- shortTokenDigits: Short token is digits if true, else alphanumeric. Default is true.
- delay: Duration for sign up email verification token in ms. Default is 5 days.
- resetDelay: Duration for password reset token in ms. Default is 2 hours.
- userPropsForShortToken: A 6-digit short token is more susceptible to brute force attack than a 30-char token.
   Therefore the verifySignupShort and resetPwdShort API calls require the user be identified
   using a find-query-like object. To prevent this itself from being an attack vector,
   userPropsForShortToken is an array of valid properties allowed in that query object.
   The default is ['email']. You may change it to ['email', 'username'] if you want to
   identify users by {email} or {username} or {email, username}.

The service creates and maintains the following properties in the `user` item:

- isVerified:        if the user's email addr has been verified (boolean)
- verifyToken:       the 30-char token generated for email addr verification (string)
- verifyTokenShort:  the 6-digit token generated for email addr verification (string)
- verifyExpires:     when the email addr token expire (Date)
- resetToken:        the 30-char token generated for forgotten password reset (string)
- resetTokenShort:   the 6-digit token generated for forgotten password reset (string)
- resetExpires:      when the forgotten password token expire (Date)


The `users` service is expected to be already configured.
Its `patch` method is used to update the password when needed,
therefore `patch` may *not* have a `auth.hashPassword()` hook.


## <a name="client"> Client

The service may be called on the client using
- [Using Feathers method calls](#methods)
- [Provided service wrappers](#wrappers)
- [HTTP fetch](#fetch)
- [React's Redux](#redux)
- [Vue 2.0 (docs todo)](#vue)

### <a name="methods"> Using Feathers' method calls
Method calls return a Promise unless a callback is provided.

```javascript
const verifyReset = app.service('verifyReset');

// check props are unique in the users items
verifyReset.create({ action: 'checkUnique',
  value: uniques, // e.g. {email, username}. Props with null or undefined are ignored.
  ownId, // excludes your current user from the search
  meta: { noErrMsg }, // if return an error.message if not unique
}, {}, cb)

// resend email verification notification
verifyReset.create({ action: 'resendVerifySignup',
  value: emailOrToken, // email, {email}, {token}
  notifierOptions: {}, // options passed to options1.notifier, e.g. {transport: 'sms'}
}, {}, cb)

// email addr verification with long token
verifyReset.create({ action: 'verifySignupLong',
  value: token, // compares to .verifyToken
}, {}, cb)

// email addr verification with short token
verifyReset.create({ action: 'verifySignupShort',
  value: {
    token, // compares to .verifyTokenShort
    user: {} // identify user, e.g. {email: 'a@a.com'}. See options1.userPropsForShortToken.
  }
}, {}, cb)

// send forgotten password notification
verifyReset.create({ action: 'sendResetPwd',
  value: email,
  notifierOptions: {}, // options passed to options1.notifier, e.g. {transport: 'sms'}
}, {}, cb)

// forgotten password verification with long token
verifyReset.create({ action: 'resetPwdLong',
  value: {
    token, // compares to .resetToken
    password, // new password
  },
}, {}, cb)

// forgotten password verification with short token
verifyReset.create({ action: 'resetPwdShort',
  value: {
    token, // compares to .resetTokenShort
    password, // new password
    user: {} // identify user, e.g. {email: 'a@a.com'}. See options1.userPropsForShortToken.
  },
}, {}, cb)

// change password
verifyReset.create({ action: 'passwordChange',
  value: {
    oldPassword, // old password for verification
    password, // new password
  },
}, { user }, cb)

// change email
verifyReset.create({ action: 'emailChange',
  value: {
    password, // current password for verification
    email, // new email
  },
}, { user }, cb)

// Authenticate user and log on if user is verified.
var cbCalled = false;
app.authenticate({ type: 'local', email, password })
  .then((result) => {
    const user = result.data;
    if (!user || !user.isVerified) {
      app.logout();
      cb(new Error(user ? 'User\'s email is not verified.' : 'No user returned.'));
      return;
    }
    cbCalled = true;
    cb(null, user);
  })
  .catch((err) => {
    if (!cbCalled) { cb(err); } // ignore throws from .then( cb(null, user) )
  });
````

### <a name="wrappers"> Provided service wrappers
The wrappers return a Promise unless a callback is provided.
See `example/` for a working example of wrapper usage.

```javascript`
<script src=".../feathers-service-verify-reset/lib/client.js"></script>
  or
import VerifyRest from 'feathers-service-verify-reset/lib/client';

const app = feathers() ...
const verifyReset = new VerifyReset(app);

// check props are unique in the users items
verifyReset.checkUnique(uniques, ownId, ifErrMsg, cb)

// resend email verification notification
verifyReset.resendVerifySignup(emailOrToken, notifierOptions, cb)

// email addr verification with long token
verifyReset.verifySignupLong(token, cb)

// email addr verification with short token
verifyReset.verifySignupShort(token, userFind, cb)

// send forgotten password notification
verifyReset.sendResetPwd(email, notifierOptions, cb)

// forgotten password verification with long token
verifyReset.resetPwdLong(token, password, cb)

// forgotten password verification with short token
verifyReset.resetPwdShort(token, userFind, password, cb)

// change password
verifyReset.passwordChange(oldPassword, password, user, cb)

// change email
verifyReset.emailChange(password, email, user, cb)

// Authenticate user and log on if user is verified.
verifyReset.authenticate(email, password, cb)
```

### <a name="fetch"> HTTP fetch (docs to complete)

```javascript
// check props are unique in the users items
// Set params just like [Feathers method calls.](#methods)
fetch('/verifyReset', {
  method: 'POST', headers: { Accept: 'application/json' },
  body: JSON.stringify({ action: 'checkUnique', value: uniques, ownId, meta: { noErrMsg } })
})
  .then(data => { ... }).catch(err => { ... });
```

You will want to refer to
[authenticating over HTTP](https://docs.feathersjs.com/authentication/readme.html#authentication-over-rest).


### <a name="redux"> React's Redux
See `feathers-reduxify-services` for information about state, etc.
See `feathers-starter-react-redux-login-roles` for a working example.

#### <a name="reduxServices"> Dispatching services

```javascript
import feathers from 'feathers-client';
import reduxifyServices, { getServicesStatus } from 'feathers-reduxify-services';
const app = feathers().configure(feathers.socketio(socket)).configure(feathers.hooks());
const services = reduxifyServices(app, ['users', 'verifyReset', ...]);
...
// hook up Redux reducers
export default combineReducers({
  users: services.users.reducer,
  verifyReset: services.verifyReset.reducer,
});
...

// email addr verification with long token
// Feathers is now 100% compatible with Redux. Use just like [Feathers method calls.](#methods)
store.dispatch(services.verifyReset.create({ action: 'verifySignupLong',
    value: token, // compares to .verifyToken
  }, {})
);
```

#### <a name="reduxAuth"> Dispatching authentication. User must be verified to sign in.

```javascript
const reduxifyAuthentication = require('feathers-reduxify-authentication');
const signin = reduxifyAuthentication(app, { isUserAuthorized: (user) => user.isVerified });

// Sign in with the JWT currently in localStorage
if (localStorage['feathers-jwt']) {
  store.dispatch(signin.authenticate()).catch(err => { ... });
}

// Sign in with credentials
store.dispatch(signin.authenticate({ type: 'local', email, password }))
  .then(() => { ... )
  .catch(err => { ... });
```

### <a name="vue"> Vue 2.0 (docs todo)


## Hooks
The service does not itself handle creation of a new user account nor the sending of the initial
email verification request.
Instead hooks are provided for you to use with the `users` service `create` method.

```javascript
const verifyHooks = require('feathers-service-verify-reset').verifyResetHooks;
// users service
module.exports.before = {
  create: [
    auth.hashPassword(),
    verifyHooks.addVerification() // adds .isVerified, .verifyExpires, .verifyToken props
  ]
};
module.exports.after = {
  create: [
    hooks.remove('password'),
    aHookToEmailYourVerification(),
    verifyHooks.removeVerification() // removes verification/reset fields other than .isVerified
  ]
};
```

A hook is provided to ensure the user's email addr is verified:

```javascript
const auth = require('feathers-authentication').hooks;
const verify = require('feathers-service-verify-reset').hooks;
export.before = {
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    verify.isVerified()
  ]
};
```

An email to verify the user's email addr can be sent when user if created on the server,
e.g. `example/src/services/user/hooks/index`:

## <a name="database"> Database

The service adds the following optional properties to the user item.
You should add them to your user model if your database uses models.

```javascript
{
  isVerified: { type: Boolean },
  verifyToken: { type: String },
  verifyExpires: { type: Date }, // or a long integer
  resetToken: { type: String },
  resetExpires: { type: Date }, // or a long integer
}
```

## <a name="routing"> Routing

The client handles all interactions with the user.
Therefore the server must serve the client app when, for example, a URL link is followed
for email addr verification.
The client must do some routing based on the path in the link.

Assume you have sent the email link:
`http://localhost:3030/socket/verify/12b827994bb59cacce47978567989e`

The server serves the client app on `/socket`:

```javascript
// Express-like middleware provided by Feathersjs.
app.use('/', serveStatic(app.get('public')))
   .use('/socket', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'socket.html')); // serve the client
  })
```

The client then routes itself based on the URL.
You will likely use you favorite client-side router,
but a primitive routing would be:

```javascript
const [leader, provider, action, slug] = window.location.pathname.split('/');

switch (action) {
  case 'verify':
    verifySignUp(slug);
    break;
  case 'reset':
    resetPassword(slug);
    break;
  default:
    // normal app startup
}
```

## <a name="security"> Security
- The user must be identified when the short token is used, making the short token less appealing
as an attack vector.
- The long and short tokens are erased on successful verification and password reset attempts.
New tokens must be acquired for another attempt.
- API params are verified to be strings. If the param is an object, the values of its props are
verified to be strings.
- options1.userPropsForShortToken restricts the prop names allowed in param objects.

## <a name="configurable"> Configurable
The length of the "30-char" token is configurable.
The length of the "6-digit" token is configurable. It may also be configured as alphanumeric.

## <a name="migration"> Migration from 0.8.0
A few changes are needed to migrate to 1.0.0. Names were standardized throughout the
new version and these had to be changed.

```text
options1.notifier signature
  was (type, user1, params, cb)
  now (type, user1, notifierOptions, newEmail, cb)
options1.notifier param 'type'
  'resend'   now 'resendVerifySignup'
  'verify'   now 'verifySignup'
  'forgot'   now 'sendResetPwd'
  'reset'    now 'resetPwd'
  'password' now 'passwordChange'
  'email'    now 'emailChange'

Error messages used to return
  new errors.BadRequest('Password is incorrect.',
    { errors: { password: 'Password is incorrect.' } })
This was hacky although convenient if the names matched your UI. Now they return
  new errors.BadRequest('Password is incorrect.',
    { errors: { password: 'Password is incorrect.', $className: 'badParams' } })
or even
  new errors.BadRequest('Password is incorrect.',
    { errors: { $className: 'badParams' } })
Set your local UI errors based on the $className value.

The following are deprecated but remain working. They will be removed in the future.
options1
  emailer    uses options1.notifier
API param 'action'
  'unique'   uses 'checkUnique'
  'resend'   uses 'resendVerifySignup'
  'verify'   uses 'verifySignupLong'
  'forgot'   uses 'sendResetPwd'
  'reset'    uses 'resetPwdLong'
  'password' uses 'passwordChange'
  'email'    uses 'emailChange'
client wrapper
  .unique            uses .checkUnique
  .verifySignUp      uses .verifySignupLong
  .sendResetPassword uses .sendResetPwd
  .saveResetPassword uses .resetPwdLong
  .changePassword    uses .passwordChange
  .changeEmail       uses .emailChange

The service now uses the route /verifyreset rather than /verifyReset/:action/:value
```


## <a name="motivation"> Motivation

Email addr verification and handling forgotten passwords are common features
these days. This package adds that functionality to Feathersjs.

## <a name="install"> Install package

Install [Nodejs](https://nodejs.org/en/).

Run `npm install feathers-service-verify-reset --save` in your project folder.

You can then require the utilities.

`/src` on GitHub contains the ES6 source.
It will run on Node 6+ without transpiling.


## <a name="exampleRun"> Install and run example

`cd example`

`npm install`

`npm start`

Point browser to `localhost:3030/socket` for the socketio client,
to `localhost:3030/rest` for the rest client.

The two clients differ only in their how they configure `feathers-client`.

[feathers-starter-react-redux-login-roles](https://github.com/eddyystop/feathers-starter-react-redux-login-roles)
is a full-featured example of using this repo with React and Redux.


## <a name="tests"> Tests

`npm test` to transpile to ES5 code, eslint and then run tests on Nodejs 6+.


## Change Log

[List of notable changes.](./CHANGELOG.md)

## Contributors

- [eddyystop](https://github.com/eddyystop)

## License

MIT. See LICENSE.