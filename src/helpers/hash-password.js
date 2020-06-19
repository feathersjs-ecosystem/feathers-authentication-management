const auth = require('@feathersjs/authentication-local').hooks;

module.exports = hashPassword;

async function hashPassword (app, password, field) {
  if (!field) throw new Error('Field is missing');
  const context = {
    type: 'before',
    data: { [field]: password },
    params: { provider: null },
    app
  };
  const newContext = await auth.hashPassword(field)(context);
  return newContext.data[field];
}
