
DONE - test for err.errors, className, etc.
DONE - test client.js wrappers
DONE - check we use     users = feathersStubs.users(app, --->db<---); in tests
DONE - options: delays for verify and reset password?
DONE - test non-paginated users.
DONE - replace iff() with the one in feathers-hooks-common.

- UI to exercise all features (Isn't feathers-starter-react-redux-login-roles good enough?)
- delete user
- delete users not verified after, say, 15 days.


Potential changes for v1.1.0.
- `checkUniqueness(uniques, ownId, meta)` OK
- `resendVerifySignup(emailOrToken, notifierOptions)`
    - find user with any props in options.userPropsForShortToken
    - `userNotifer` uses `user.primaryCommunication` to route notification.
- `verifySignupWithLongTokenverifySignupWithLongToken(verifyToken)` OK
- `verifySignupWithShortToken(verifyShortToken, findUser)` OK
- `sendResetPwd(email, notifierOptions)`
    - find user with any props in options.userPropsForShortToken
    - `userNotifer` uses `user.primaryCommunication` to route notification.
- `resetPwdWithLongToken(resetToken, password)` OK
-`resetPwdWithShortToken(resetShortToken, findUser, password)` OK
- `passwordChange(user, oldPassword, password)` [edit]
    - `user.email` is used. [edit]
- `emailChange(user, password, email)`
    - change name to changeCommunication
    - email param is now { prop: value } for any prop in options.userPropsForShortToken
    - set the new field `user.verifyProp` to { prop: value }
    - generate verifyToken, verifyTokenShort and verifyExpires.
    - isVerified remains true so user can still sign in until notification is verified.
    - call `userNotifier` to send the verify tokens like resendVerifySignup does now.
        - a simple notification if `prop` !== `user.primaryCommunication`
        - notifications to old and new values if `prop` === `user.primaryCommunication`
    - this call allows a change for any options.userPropsForShortToken value to be verified, not just the `user.primaryCommunication` one. 
- `verifySignup(query, tokens)`: called by verifySignupWithLongToken and verifySignupWithShortToken
    - use `user.verifyProp` to change the appropriate field.
    - erase `user.verifyProp` along with verifyToken, verifyTokenShort and verifyExpires.
- Its probably best to set `user.verifyProp` on initial creation of user so that case is not different than emailChange.
- change `sanitizeUserForEmail` to `sanitizeUserForNotifier`. [edit]
- Maybe rename `options.userPropsForShortToken`.

Perhaps we should have a sign in wrapper and/or API which helps with the following.
- let's say `username` is what the `authenticate` is configured to use.
- one user enters username on sign in screen, another enters their cell#, a third their wechat handle.
- the client does a find on `users` with what was entered to identify the user.
- the client does `authenticate` with the password and `user.username` to sign in.
- Come to think of it, instead of `username` you could use a field populated with a randomly generated string. Perhaps even use `_id`.
- However it may be wise for the wrapper not to call `feathers.authenticate` itself.
    
The present wrapper `authenticate` may have to change for authenticate 1.0
- Will we have to retain the current one for legacy purposes?

[edited with beeplin's comment below]

=============================

@eddyystop a couple suggestions I have:

- *DONE* We made auth generic so it doesn't assume a `user` it just defaults to one but you can customize the `service` and the `entity` options. I think this likely should do the same. 95% of the time it will be a user but this service could easily be applied to other entities (such as an organization).
- *DONE* We can make the `ownId` field more flexible by using `service.id` on [this line](https://github.com/eddyystop/feathers-service-verify-reset/blob/master/src/index.js#L463). See how I do it with [feathers-authentication-jwt](https://github.com/feathersjs/feathers-authentication-jwt/blob/master/src/verifier.js#L21). All datastore backed service adapters now have an `id` field.
- We look to see how we can share the password hashing functions as a common module instead of replicating in auth and this plugin.
- *DONE* Split out the functions inside `index.js` to separate files to make the files smaller and easier to trace through
- *DONE* rename `restrictToVerified` hook to `isVerified` so that it follows the same naming convention as feathers-permissions and feathers-authentication.
- *DONE* rename `userNotifier` to just `notifier`
- *DONE* [these hooks](https://github.com/eddyystop/feathers-service-verify-reset/blob/master/src/index.js#L381-L382) need to change to `auth.hooks.authenticate('jwt')`(or whatever strategy you want) and imho should be registered by the developer instead of hidden away in the service.
- *DONE* FYI if you implement a `setup` method you don't need to do [this](https://github.com/eddyystop/feathers-service-verify-reset/blob/master/src/index.js#L390) here and instead can set `this.service` inside the setup method.

=================================

- *DONE* rename `spyEmailer` to `spyNotifier`

=================================

Migration
- `options.userPropsForShortToken` renamed `options.identifyUserProps`.
It contains all fields uniquely identifying the user.
These will mainly be communications (email, cellphone, facebook) but also username.
- The prop names in `options.identifyUserProps` need to have unique key columns in the DB.
This repo uses DB failures to catch duplicate keys,
because `.verifyChange` values makes catching potential duplicates difficult.
- user item should have a `primaryCommunication` prop for the notifier.
- `hooks.restrictToVerified` renamed `hooks.isVerified`
- `options.userNotifier` renamed `options.notifier`
- notifier must return a promise
- `notifier(p1, p2, p3)` now, not `(p1, p2, p3, newEmail)`. Contents of changes in `verifyChange`.
- notifier type `emailChange` is now `identityChange`
- `resendVerifySignup` no longer allows a string param to be the email
- `verifyReset` param `actions` removed: unique, resend, verify, forgot, reset, password, email
- `options.service` added. default '/users' ** Does this satisfy needs e.g. signin by organization?**
- service accessed by `require(repo-name)` now, not `require(repo-name).service`.
- hooks still accessed by `require('repo-name').hooks`.
- `hooks.addVerification`'s `options.len` removed. use `options.longTokenLen`
- wrapper `sendResetPwd(identifyUser, notifierOptions)` now, not `(email, notifierOptions)`
- wrapper `passwordChange(oldPassword, password, identifyUser)` now, not `(oldPassword, password, user)`
- wrapper `identityChange(password, changesIdentifyUser, identifyUser)` now, not `emailChange(password, email, user)`
- neither the service nor the wrappers support callbacks.
Callbacks for services are being removed from feathers in early 2017 with the Buzzard release.

- service changed from
```javascript
    verifyReset.create({
      action: 'passwordChange',
      value: { oldPassword: plainPassword, password: plainNewPassword },
    }, { user: paramsUser }, cb)
```
to
```javascript
    verifyReset.create({
      action: 'passwordChange',
      value: { user: { email }, oldPassword: plainPassword, password: plainNewPassword },
    }, {}, cb)
```
- service changed from
```javascript
    verifyReset.create({
      action: 'emailChange',
      value: { password: plainPassword, email: newEmail },
    }, { user: paramsUser }, cb)
```
to
```javascript
    verifyReset.create({
      action: 'identityChange',
      value: { user: { email }, password: plainPassword, changes: { email, cellphone } },
    }, {}, cb)
```


- user needs to add these hooks for the verifyReset service:
  for feathers-authenticate < v1.0
```javascript
    const isAction = (...args) => hook => args.includes(hook.data.action);
    before: {
        create: [
          hooks.iff(isAction('passwordChange', 'emailChange'), auth.verifyToken()),
          hooks.iff(isAction('passwordChange', 'emailChange'), auth.populateUser()),
        ],
    },
````
  or for feathers-authenticate v1.0
```javascript
    const isAction = (...args) => hook => args.includes(hook.data.action);
    before: {
      create: [
        hooks.iff(isAction('passwordChange', 'emailChange'), auth.hooks.authenticate('jwt')),
        hooks.iff(isAction('passwordChange', 'emailChange'), auth.populateUser()),
      ],
    },
```
