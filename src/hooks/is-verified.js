
const errors = require('@feathersjs/errors');
const { checkContext } = require('feathers-hooks-common');

module.exports = isVerified;

function isVerified () {
  return hook => {
    checkContext(hook, 'before');

    if (!hook.params.user || !hook.params.user.isVerified) {
      throw new errors.BadRequest('User\'s email is not yet verified.');
    }
  };
}
