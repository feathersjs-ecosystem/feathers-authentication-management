
const service = require('./service');
const hooks = require('./hooks');

service.hooks = hooks;
module.exports = service;
