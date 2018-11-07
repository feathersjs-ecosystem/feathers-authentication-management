
const auth = require('@feathersjs/authentication-local').hooks;

module.exports = hashPassword;

async function hashPassword (app, password) {
  const context = {
    type: 'before',
    data: { password },
    params: { provider: null },
    app
  };

  const newContext = await auth.hashPassword()(context);
  return newContext.data.password;
}
