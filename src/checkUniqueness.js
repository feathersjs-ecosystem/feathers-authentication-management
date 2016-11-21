
/* eslint-env node */

const errors = require('feathers-errors');
const debug = require('debug')('verify-reset:checkUniqueness');

module.exports = function checkUniqueness (options, uniques, ownId, meta) {
  debug('checkUniqueness', uniques, ownId, meta);
  const users = options.app.service(options.service);
  const usersIdName = users.id;

  const keys = Object.keys(uniques).filter(
    key => uniques[key] !== undefined && uniques[key] !== null);

  return Promise.all(
    keys.map(prop => users.find({ query: { [prop]: uniques[prop].trim() } })
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
    });
};
