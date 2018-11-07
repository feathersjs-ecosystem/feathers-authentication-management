
const errors = require('@feathersjs/errors');

module.exports = ensureValuesAreStrings;

function ensureValuesAreStrings (...rest) {
  if (!rest.every(str => typeof str === 'string')) {
    throw new errors.BadRequest('Expected string value. (authLocalMgnt)',
      { errors: { $className: 'badParams' } }
    );
  }
}
