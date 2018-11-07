
const errors = require('@feathersjs/errors');

module.exports = deconstructId;

function deconstructId (token) {
  if (!token.includes('___')) {
    throw new errors.BadRequest('Token is not in the correct format.',
      { errors: { $className: 'badParams' } }
    );
  }

  return token.slice(0, token.indexOf('___'));
}
