const { AuthenticationService } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { authentication: config } = require('./config');
module.exports = (app, options) => {
  if (options) {
    app.set('authentication', options);
  } else {
    app.set('authentication', config);
  }
  const authService = new AuthenticationService(app);

  authService.register('local', new LocalStrategy());
  return authService;
};
