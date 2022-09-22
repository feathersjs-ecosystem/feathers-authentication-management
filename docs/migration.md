# Migrating

This guide explains the new features and changes necessary to migrate to `feathers-authentication-management` (called `f-a-m` from now on) v4. The migration should be fairly easy. There's no breaking change at all. So just install the pre-release. That should be it. Just continue reading if you're curious what has changed.

```bash
npm i feathers-authentication-management
```

## ❗️❗️❗️ Don't expose `f-a-m` data to socket.io by default

Do you use `socket.io` and [channels](https://docs.feathersjs.com/api/channels.html) with `feathers-authentication-management`? Did you know, that the service  `authManagment` publishes every `create` request to channels? We created a [test](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/illustrate-publish-leak/test/scaffolding.test.js#L108) to illustrate the behavior. See the [test results](https://github.com/feathersjs-ecosystem/feathers-authentication-management/runs/4764626400?check_suite_focus=true).
If you do not catch that, every client received your `data` from `authManagement`. This is fixed in `f-a-m` v4 and follows the same as the official `@feathersjs/authentication`. If you don't filter the data from `authManagement`, you should upgrade asap or handle data from `authManagement` in your `channels`-file!

This could be a breaking change, if you use the published data of `authManagement` intentionally which is considered bad practice. You should use hooks instead!

## Typescript

`feathers-authentication-management`  v4 is rewritten in typescript. That means autocompletition in your IDE.

## Separate services and custom methods

Before `f-a-m` v4 there was only a main service, with a lot of `actions` for the `create` method. `f-a-m` v4 also has that but also exposes two new options to configure your feathers app. So we have three ways:
1. `old fashioned`: one main service
2. `Separate services`: For every `action` we now have a separate service that just handles the `action` via its `create` method.
3. `Custom Methods`: Feathers v5 (yet to be released) introduces a way of defining custom methods. See the official [Feathers v5 docs](https://dove.docs.feathersjs.com/api/services.html#custom-methods). `f-a-m` v4 prepares for Feathers v5 with custom methods. The old fashioned main service also has all of the `actions` as custom methods.

To illustrate the new services and custom methods and its corresponding old fashioned `action`, please see this table:

| `action` | old-fashioned `create` on `Service` | separate Service with `create` method | `custom methods` on `Service` (feathers v5 preparation) |
|---|---|---|---|
| `checkUnique` | *unchanged* | `CheckUniqueService` | `checkUnique` method |
| `resendVerifySignup` | *unchanged* | `ResendVerifySignupService` | `resendVerifySignup` method |
| `verifySignupLong` | *unchanged* | `VerifySignupLongService` | `verifySignupLong` method |
| `verifySignupShort` | *unchanged* | `VerifySignupShortService` | `verifySignupShort` method |
| `verifySignupSetPasswordLong` | *unchanged* | `VerifySignupSetPasswordLongService` | `verifySignupSetPasswordLong` method |
| `verifySignupSetPasswordShort` | *unchanged* | `VerifySignupSetPasswordShortService` | `verifySignupSetPasswordShort` method |
| `sendResetPwd` | *unchanged* | `SendResetPwdService` | `sendResetPassword` method |
| `resetPwdLong` | *unchanged* | `ResetPwdLongService` | `resetPasswordLong` method |
| `resetPwdShort` | *unchanged* | `ResetPwdShortService` | `resetPasswordShort` method |
| `passwordChange` | *unchanged* | `PasswordChangeService` | `passwordChange` method |
| `identityChange` | *unchanged* | `IdentityChangeService` | `identityChange` method |
| `options` | *unchanged* | *none* | *none* |

But the `data` for the new **separate services** and **custom methods** is also flattened compared to the old fashioned main service. See the following example for the action: `'sendResetPwd'`:

### Old Fashioned

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');
app.use('auth-management', new AuthenticationManagementService(app, options));

app.service("auth-management").create({
  action: "sendResetPwd",
  value: {
    email: "me@example.com",
  },
});
```

### Separate Service

```js
const { SendResetPwdService } = require('feathers-authentication-management');
app.use("auth-management/send-reset-password", new SendResetPwdService(app, options));

app.service("auth-management/send-reset-password").create({
  user: {
    email: "me@example.com",
  },
});
```

### Custom Method

```js
const { AuthenticationManagementService } = require('feathers-authentication-management');
app.use('auth-management', new AuthenticationManagementService(app, options));

app.service("auth-management").sendResetPassword({
  user: {
    email: "me@example.com",
  },
});
```

This is also documented in the chapter [Service Calls](./service-calls). Check that chapter out, if you need more information.

## Multi support for hook `addVerification`

The hook `addVerification` was not able to handle `multi` data. It is now.

## Recommended setup

The old docs of `f-a-m` v3 said, that you need to use `app.configure(authManagement())`. We don't know why, but it is not necessary. You can use:
```js
// services/auth-management/auth-management.service.js
const {
  AuthenticationManagementService,
} = require("feathers-authentication-management");

const notifier = require("./notifier");

module.exports = function (app) {
  app.use(
    "/auth-management",
    new AuthenticationManagementService(app, {
      notifier: notifier(app),
    })
  );
};
```

## Recommended Service Path

The default path of `app.configure(authManagement())` is `app.service('authManagement')`. Note the `camelCasing`. We consider this an anti-pattern and recommend using `kebab-casing`. That's why the [Getting Started](./getting-started) guide uses `kebab-casing`.

The hook `addVerification` optionally takes the service path as first argument. Because we don't want to break things, the default path stays `'authManagement'` as in `f-a-m` v3. So, if you change to `kebab-case`, please make sure, to call `addVerification('auth-management')`.

## Option `passwordField`

`f-a-m` v3 did not use a `passwordField` option. It defaults to `password`. This new option follows the options for `@feathersjs/authentication`.
