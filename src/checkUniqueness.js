
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('authManagement:checkUniqueness');

// This module is usually called from the UI to check username, email, etc. are unique.
module.exports = function checkUniqueness (options, identifyUser, ownId, meta) {
  debug('checkUniqueness', identifyUser, ownId, meta);
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  const keys = Object.keys(identifyUser).filter(
    key => identifyUser[key] !== undefined && identifyUser[key] !== null);

  return Promise.all(
    keys.map(prop => users.find({ query: { [prop]: identifyUser[prop].trim() } })
      .then(data => {
        const items = Array.isArray(data) ? data : data.data;
        const isNotUnique = items.length > 1 ||
          (items.length === 1 && items[0][usersIdName] !== ownId);

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
