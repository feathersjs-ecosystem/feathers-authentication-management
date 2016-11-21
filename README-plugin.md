# feathers-authentication-management

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication-management.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication-management)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication-management/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-management)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication-management/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication-management/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication-management.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication-management)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication-management.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-management)

> Adds sign up verification, forgotten password reset, and other capabilities to local feathers-authentication 

## Installation

```
npm install feathers-authentication-management --save
```

## Documentation

Please refer to the [feathers-authentication-management documentation](http://docs.feathersjs.com/) for more details.

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-management`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const plugin = require('feathers-authentication-management');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/plugin', plugin())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
