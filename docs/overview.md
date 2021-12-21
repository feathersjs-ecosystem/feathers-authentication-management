---
title: Overview
---

# {{ $frontmatter.title }}

![npm](https://img.shields.io/npm/v/feathers-authentication-management)

<!--![GitHub Workflow Status](https://img.shields.io/github/workflow/status/feathersjs-ecosystem/feathers-authentication-management/Node.js%20CI)-->

![npm](https://img.shields.io/npm/dm/feathers-authentication-management)
[![GitHub license](https://img.shields.io/github/license/feathersjs-ecosystem/feathers-authentication-management)](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/LICENSE)

Sign up verification, forgotten password reset, and other capabilities for local authentication.

This project is built for [FeathersJS](http://feathersjs.com). An open source web framework for building modern real-time applications.

The Feathers core provides a [LocalStrategy](https://docs.feathersjs.com/api/authentication/local.html) for authenticating users with a username/email and password combination. However, it does not include methods such as the verification of a user's e-mail address or sending a password reset link. The purpose of `feathers-authentication-management` is to extend Feathers's local authentication with such functionalities:

- User verification by sending a token-based verification URL.
- Password reset notifications, e. g. used for a forgotten password function.
- Secure password changes.
- Process an identity change such as a new e-mail address, or cellphone number.

All these actions require the notification of the user via a communication transport, for which the identity of the user is verified. This can be an e-mail address, a cellphone number or any other communication endpoint. `feathers-authentication-management` can be configured to use any available communication transport.

The installation and configuration of `feathers-authentication-management` require an existing Feathers application configured with local authentication and a configured communication transport such as e-mail or SMS. A basic configuration is described in chapter [Getting Started](./getting-started.md).

For most of the actions, `feathers-authentication-management` sends notifications containing links with tokens to the users. These tokens can be long if e-mails are used for the notifications (30 characters by default). However, if the user has to enter the token manually, e. g. if the token is send in a SMS, `feathers-authentication-management` provides also actions with short tokens (6 digits/characters by default).

All details about settings and the implementation of a notifier function can be found in chapter [Configuration](./configuration.md). All possible actions of this service are described in chapter [Service Calls](./service-calls.md)

### Help

Open an issue or come talk on the FeathersJS Slack.

### License

Licensed under the [MIT license](LICENSE).
