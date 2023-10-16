# Getting Started

## Introduction

Prerequisite for the installation of the `feathers-authentication-management` service is an Feathers application configured with local authentication.

This guide demonstrates the installation and configuration of `feathers-authentication-management` in three steps:

1. Installation of the `feathers-authentication-management` service and of an additional service, which performs the user notifications.
2. Extension of the users model.
3. Extension of the users service hooks.
4. Implementation of the notifier function.

The functionality of the `feathers-authentication-management` service will be demonstrated using two example actions: `resendVerifySignup` and `verifySignup`, i. e. the sending of an e-mail containing a verification link and the sending of a confirmation e-mail after successful verification, respectively.

The full process for the verification of an e-mail address spans seven steps as shown in the following figure:

<p align="center">
  <img src="/images/resendVerifySignup.png" class="medium-zoom-image">
</p>

Not all steps are performed by the service, some parts have to be implemented on the client side. The service is only responsible for steps 2 (token creation) and 6 (token verification). It triggers steps 3 (sending of the verification link including the token) and 7 (sending of a confirmation e-mail) by calling the custom notifier function. In general, the token link is opened in the client, which sends it back to the `feathers-authentication-management` service in the Feathers app. The details of the client side implementation is not part of this documentation, but the necessary steps are covered at the end of this chapter.

## Installation

The following command installs `feathers-authentication-management` and `feathers-mailer`:

<Tabs show-tabs>

  <Tab name="npm">

```bash
npm i feathers-authentication-management feathers-mailer
```

  </Tab>

  <Tab name="yarn">

  ```bash
  yarn add feathers-authentication-management feathers-mailer
  ```

  </Tab>

  <Tab name="pnpm">

  ```bash
  pnpm install feathers-authentication-management feathers-mailer
  ```

  </Tab>

</Tabs>

`feathers-mailer` is used for sending e-mails. See the [feathers-mailer (on GitHub)](https://github.com/feathersjs-ecosystem/feathers-mailer) for details of its configuration. If you want to send notifications via a different channel such as SMS, you may use and configure a different service.

Add the `feathers-authentication-management` service to your Feathers application:

```js
// services/index.js
const authManagement = require("./auth-management/auth-management.service.js");
// ...
module.exports = function (app) {
  app.configure(authManagement);
  // ...
};
```

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

The notifier function is used to create the contents various e-mails and send them via `feathers-mailer`. An example is described later in section [Implementation of the notifier function](#implementation-of-the-notifier-function).

## Extension of the users model

`feathers-authentication-management` requires several additional fields in the `user` model:

| Field              | Field Type       | Description                                                           |
| ------------------ | ---------------- | --------------------------------------------------------------------- |
| `isVerified`       | `boolean`        | Indicates if the user's e-mail address has been verified.             |
| `verifyToken`      | `string`         | A long verification token generated for verification e-mails.         |
| `verifyShortToken` | `string`         | A short verification token generated e. g. for verification SMS.      |
| `verifyExpires`    | `Date \| number` | Expiration date of the verification token.                            |
| `verifyChanges`    | `string[]`       | An array that tracks e. g. the change of an e-mail address.           |

The table contains only the necessary fields for our example with verification e-mails. A full list of fields is described in chapter [Configuration](./configuration#user-model-fields).

::: info
Make sure that the `users` model contains the fields described above and also that the `users` table in your database is extended with these fields.
:::

## Extension of the users hooks

The e-mail verification is implemented by extending the `create` hook of the `users` service. `feathers-authentication-management` provides the hooks `addVerification()` and `removeVerification()`, which have to be added to the `before` and `after` methods:

```js
// users.hooks.js
const { authenticate } = require("@feathersjs/authentication").hooks;
const { 
  hashPassword, 
  protect 
} = require("@feathersjs/authentication-local").hooks;
const { 
  addVerification, 
  removeVerification 
} = require("feathers-authentication-management");
const authNotifier = require("../auth-management/notifier");

const sendVerify = () => {
  return async (context) => {
    const notifier = authNotifier(context.app);

    const users = Array.isArray(context.result) 
      ? context.result
      : [context.result];

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
    create: [hashPassword("password"), addVerification("auth-management")],
    update: [hashPassword("password"), authenticate("jwt")],
    patch: [hashPassword("password"), authenticate("jwt")],
    remove: [authenticate("jwt")]
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
      sendVerify(),
      removeVerification()
    ],
    update: [],
    patch: [],
    remove: []
  }
};
```

The `after:create` method is also extended with a call of the `notifier` function. This function is described in the next section. Here, it is used for sending the verification e-mail.

## Implementation of the notifier function

The notifier function is used by `feathers-authentication-management` to create and send the user's notifications. It is called with three parameters:

- `type` describing the kind of action,
- the `user` object,
- an additional `notifierOptions` object.

Depending on the value of `type`, the function creates the content of an e-mail and sends it using the `feathers-mailer` service.

The following example shows a minimal version for sending an e-mail after the service actions `resendVerifySignup` and `verifySignup`. For the first one, a token link has to be created and to be added to the e-mail content. This token has been generated by `feathers-authentication-management` and can be found in the `user` object data.

```js
// services/auth-management/notifier.js
module.exports = (app) => {
  function getLink(type, hash) {
    return "http://localhost:3030/" + type + "?token=" + hash;
  }

  async function sendEmail(email) {
    try {
      const result = await app.service("mailer").create(email);
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  return (type, user, notifierOptions = {}) => {
    if (type === "resendVerifySignup") {
      return sendEmail({
        from: "test@localhost",
        to: user.email,
        subject: "Please confirm your e-mail address",
        text: "Click here: " + getLink("verify", user.verifyToken),
      });
    } else if (type === "verifySignup") {
      return sendEmail({
        from: "test@localhost",
        to: user.email,
        subject: "E-Mail address verified",
        text: "Registration process complete. Thanks for joining us!",
      });
    }
  };
};
```

## Client side implementation

The link in the verification e-mail should lead to the client part of your application. The client sends the verification token to the `feathers-authentication-management` service, e. g. by using a POST request as follows:

```js
// Endpoint: /auth-management
// Request body:
{
  action: 'verifySignupLong',
  value: // the verifyToken,
}
```

More details and alternative request methods can be found in chapter [Service Calls](./service-calls).

Finally, the services compares the token and triggers a confirmation e-mail after successful validation.
