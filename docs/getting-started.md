---
title: Getting Started
---

# {{ $frontmatter.title }}

Prerequisite for the installation of the `feathers-authentication-management` service is an existing Feathers application configured with local authentication.

This guide demonstrates the installation and configuration of `feathers-authentication-management` in three steps:

1. Installation of the `feathers-authentication-management` service and of an additional service, which performs the user notifications.

2. Extension of the `users` model.

3. Extension of the `users` hooks.

4. Implementation of the notifier function.

The functionality of the `feathers-authentication-management` service will be demonstrated using two examples: _verification e-mails_ and _password reset e-mails_. For a full list of functions please see chapter [Usage](./usage).

## Installation

The following command installs `feathers-authentication-management` and `feathers-mailer`:

```bash
npm i feathers-authentication-management feathers-mailer
# or
yarn add feathers-authentication-management feathers-mailer
```

`feathers-mailer` is used for sending e-mails. See the [feathers-mailer (on GitHub)](https://github.com/feathersjs-ecosystem/feathers-mailer) for details of its configuration. If you want to send notifications via a different channel such as SMS, you may use and configure a different service.

Add `feathers-authentication-management` to your Feathers application:

```js
// app.js
const authManagement = require("feathers-authentication-management");
const notifier = require("./notifier");

app.configure(authManagement(notifier(app)));
```

The notifier function is used to create the contents various e-mails and send them via `feathers-mailer`. An example is described later in section [Implementation of the notifier function](#implementation-of-the-notifier-function).

## Extension of the users model

`feathers-authentication-management` requires several additional fields in the `user` model:

| Field           | Data Type    | Description                                                           |
| --------------- | ------------ | --------------------------------------------------------------------- |
| `isVerified`    | Boolean      | Indicates if the user's e-mail address has been verified.             |
| `verifyToken`   | String       | The verification token generated for verification e-mails.            |
| `verifyExpires` | Date\|Number | Expiration date of the verification token.                            |
| `verifyChanges` | String[]     | An array that tracks e.g. the change of an e-mail address.            |
| `resetToken`    | String       | The reset token generated for password reset e-mails.                 |
| `resetExpires`  | Date\|Number | Expiration date of the reset token.                                   |
| `resetAttempts` | Number       | Amount of incorrect reset submissions left before token invalidation. |

The table contains only the necessary fields for our example with e-mail notifications. A full list of fields is described in chapter [Configuration](./configuration#user-model-fields).

::: info
Make sure that the `users` model contains the fields described above and also that the `users` table in your database is extended with these fields.
:::

## Extension of the users hooks

The e-mail verification is implemented by extending the `create` hook of the `users` service. `feathers-authentication-management` provides the hooks `addVerification()` and `removeVerification()`, which have to be added to the `before` and `after` methods:

```js
// users.hooks.js
const { authenticate } = require("@feathersjs/authentication").hooks;
const { hashPassword, protect } =
  require("@feathersjs/authentication-local").hooks;
const { addVerification, removeVerification } =
  require("feathers-authentication-management").hooks;
const authNotifier = require("../../notifier");

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt")],
    get: [authenticate("jwt")],
    create: [hashPassword("password"), addVerification()],
    update: [hashPassword("password"), authenticate("jwt")],
    patch: [hashPassword("password"), authenticate("jwt")],
    remove: [authenticate("jwt")],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password"),
    ],
    find: [],
    get: [],
    create: [
      (context) => {
        authNotifier(context.app).notifier("verifySignupLong", context.result);
      },
      removeVerification(),
    ],
    update: [],
    patch: [],
    remove: [],
  },
};
```

The `create` `after` method is also extended with a call of the `notifier` function. This function is described in the next section. Here, it is used for sending the verification e-mail.

## Implementation of the notifier function

The notifier function is used by `feathers-authentication-management` to create and send the user's notifications. It is called with three parameters `type` describes the kind of action, the `user` object and additional `notifierOptions`. Depending of `type`, the function creates the content of the e-mails and sends them via `feathers-mailer`.

The following examples shows a minimal version for _verification e-mails_ (`verifySignupLong`) and and _password reset e-mails_ (`sendResetPwd`). For both, a token link has to be created and to be added to the e-mail content. The token is taken from the `users` object.

```js
// nofifier.js
module.exports = (app) => {
  return {
    notifier: function (type, user, notifierOptions) {
      switch (type) {
        case "verifySignupLong":
          return sendEmail({
            from: "test@localhost",
            to: user.email,
            subject: "Please confirm your e-mail address",
            text: getLink("verify", user.verifyToken),
          });
          break;

        case "sendResetPwd":
          return sendEmail({
            from: "test@localhost",
            to: user.email,
            subject: "Password request",
            text: getLink("reset", user.resetToken),
          });
          break;

        default:
          break;
      }
    },
  };

  function getLink(type, hash) {
    return "http://localhost:3030/" + type + "?token=" + hash;
  }

  async function sendEmail(email) {
    try {
      const result = app.service("mailer").create(email);
    } catch (err) {
      console.error(err);
    }
  }
};
```
