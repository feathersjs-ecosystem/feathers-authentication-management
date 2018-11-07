
const errors = require('@feathersjs/errors');

module.exports = ensureObjPropsValid;

function ensureObjPropsValid (obj, props, allowNone) {
  const keys = Object.keys(obj);
  const valid = keys.every(key => props.includes(key) && typeof obj[key] === 'string');

  if (!valid || (keys.length === 0 && !allowNone)) {
    throw new errors.BadRequest('User info is not valid. (authLocalMgnt)',
      { errors: { $className: 'badParams' } }
    );
  }
}
