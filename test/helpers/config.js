module.exports = {
  timeoutEachTest: 40000,
  maxTimeAllTests: 1000 * 60 * 60 * 2, // 2 hours
  defaultVerifyDelay: 1000 * 60 * 60 * 24 * 5, // 5 days
  authentication: {
    entity: 'user',
    service: 'users',
    secret: 'QM7Pn9fttvOOGI+VJym3KSJnUSoaspodkapsokdpaoskdpokasdopkaspokdpaosk=',
    authStrategies: ['local'],
    local: {
      usernameField: 'email',
      passwordField: 'password'
    }
  }
};
