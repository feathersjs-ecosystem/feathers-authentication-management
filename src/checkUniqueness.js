
/* eslint-env node */

const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:checkUniqueness');

const {
  findUser
} = require('./helpers');

// This module is usually called from the UI to check username, email, etc. are unique.
module.exports = function checkUniqueness (options, params, identifyUser, ownId, meta) {
  debug('checkUniqueness', identifyUser, ownId, meta);
  const users = options.app.service(options.service);

  const keys = Object.keys(identifyUser).filter(
    key => identifyUser[key] !== undefined && identifyUser[key] !== null);

  return Promise.all(
    keys.map(prop => findUser(users, { [prop]: identifyUser[prop].trim() }, params)
      .then(data => {
        const items = Array.isArray(data) ? data : data.data;
        const isNotUnique = items.length > 1 ||
          (items.length === 1 && items[0][users.id] !== ownId);

        return isNotUnique ? prop : null;
      })
    ))
    .catch(err => {
      throw new errors.GeneralError(err);
    })
    .then(allProps => {
      const errProps = allProps.filter(prop => prop);

      if (errProps.length) {
        const errs = {};
        errProps.forEach(prop => { errs[prop] = 'Already taken.'; });

        throw new errors.BadRequest(meta.noErrMsg ? null : 'Values already taken.',
          { errors: errs }
        );
      }

      return null;
    });
};
