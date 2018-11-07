
const errors = require('@feathersjs/errors');
const { checkContext } = require('feathers-hooks-common');
const { getLongToken, getShortToken, ensureFieldHasChanged } = require('../helpers');

module.exports = addVerification;

function addVerification (path) {
  return hook => {
    checkContext(hook, 'before', ['create', 'patch', 'update']);

    return Promise.resolve()
      .then(() => hook.app.service(path || 'authManagement').create({ action: 'options' }))
      .then(options => Promise.all([
        options,
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ]))
      .then(([options, longToken, shortToken]) => {
        // We do NOT add verification fields if the 3 following conditions are fulfilled:
        // - hook is PATCH or PUT
        // - user is authenticated
        // - user's identifyUserProps fields did not change
        if (
          (hook.method === 'patch' || hook.method === 'update') &&
          !!hook.params.user &&
          !options.identifyUserProps.some(ensureFieldHasChanged(hook.data, hook.params.user))
        ) {
          return hook;
        }

        hook.data.isVerified = false;
        hook.data.verifyExpires = Date.now() + options.delay;
        hook.data.verifyToken = longToken;
        hook.data.verifyShortToken = shortToken;
        hook.data.verifyChanges = {};

        return hook;
      })
      .catch(err => {
        throw new errors.GeneralError(err);
      });
  };
}
