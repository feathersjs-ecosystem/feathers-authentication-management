---
title: Overview
---

# {{ $frontmatter.title }}

![npm](https://img.shields.io/npm/v/feathers-authentication-management)

<!--![GitHub Workflow Status](https://img.shields.io/github/workflow/status/feathersjs-ecosystem/feathers-authentication-management/Node.js%20CI)-->

![npm](https://img.shields.io/npm/dm/feathers-authentication-management)
[![GitHub license](https://img.shields.io/github/license/feathersjs-ecosystem/feathers-authentication-management)](https://github.com/feathersjs-ecosystem/feathers-authentication-management/blob/master/LICENSE)

Sign up verification, forgotten password reset, and other capabilities for local authentication.

This project is built for [Feathers](http://feathersjs.com) – an open source framework for real-time applications and REST APIs.

The Feathers core provides a [LocalStrategy](https://docs.feathersjs.com/api/authentication/local.html) for authenticating users with a username/email and password combination. However, it does not include methods such as the verification of a user's e-mail address or sending a password reset link. The purpose of `feathers-authentication-management` is to extend Feathers's local authentication with such functionalities.

### Features

- User verification by sending a token-based verification URL.
- Password reset notifications, e. g. for forgotten password functions.
- Secure password changes.
- Processing of identity changes such as a new e-mail address, or cellphone number.

These actions require the notification of the user via a communication transport, for which the identity of the user is verified. This can be an e-mail address, a cellphone number or any other communication endpoint. `feathers-authentication-management` can be configured to use any available communication transport.

The installation and configuration of `feathers-authentication-management` require a Feathers application configured with local authentication and with a communication transport such as e-mail or SMS. A basic installation is described in chapter [Getting Started](./getting-started), while an overview of the functionality is given in chapter [Process Flows](./process-flows).

For most of the actions, `feathers-authentication-management` sends notifications containing tokens to the users. These tokens can be long and embedded in URLs if e-mails are used for the notifications (token length of 30 characters by default). However, if the user has to enter the token manually, e. g. if the token is send directly in a SMS, the service provides also actions with short tokens (6 digits/characters by default).

Details about settings and the implementation of a notifier function can be found in chapter [Configuration](./configuration). All possible actions of this service are described in chapter [Service Calls](./service-calls).

### Help

Open an issue or come talk on the Feathers Slack ([slack.feathersjs.com](slack.feathersjs.com)).

### License

Licensed under the [MIT license](LICENSE).
