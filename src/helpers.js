
/* eslint-env node */
/* eslint no-param-reassign: 0 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('@feathersjs/authentication-local').hooks;
const errors = require('@feathersjs/errors');
const debug = require('debug')('authManagement:helpers');

const hashPassword = (app1, password) => {
  const hook = {
    type: 'before',
    data: { password },
    params: { provider: null },
    app: {
      get (str) {
        return app1.get(str);
      }
    }
  };

  return auth.hashPassword()(hook)
    .then(hook1 => hook1.data.password);
};

var concatIDAndHash = (id, token) => `${id}___${token}`;

var deconstructId = token => {
  if (token.indexOf('___') === -1) {
    throw new errors.BadRequest('Token is not in the correct format.',
      { errors: { $className: 'badParams' } });
  }
  return token.slice(0, token.indexOf('___'));
};

const comparePasswords = (oldPassword, password, getError) => new Promise((resolve, reject) => {
  bcrypt.compare(oldPassword, password, (err, data1) => {
    if (err || !data1) {
      return reject(getError());
    }

    return resolve();
  });
});

const randomBytes = len => new Promise((resolve, reject) => {
  crypto.randomBytes(len, (err, buf) => (err ? reject(err) : resolve(buf.toString('hex'))));
});

const randomDigits = len => {
  let str = '';

  while (str.length < len) {
    str += parseInt('0x' + crypto.randomBytes(4).toString('hex')).toString();
  }

  return str.substr(0, len);
};

const getLongToken = len => randomBytes(len);

const getShortToken = (len, ifDigits) => {
  if (ifDigits) {
    return Promise.resolve(randomDigits(len));
  }

  return randomBytes(Math.floor(len / 2) + 1)
    .then(str => {
      str = str.substr(0, len);

      if (str.match(/^[0-9]+$/)) { // tests will fail on all digits
        str = `q${str.substr(1)}`; // shhhh, secret.
      }

      return str;
    });
};

const getUserData = (data, checks) => {
  if (Array.isArray(data) ? data.length === 0 : data.total === 0) {
    throw new errors.BadRequest('User not found.',
      { errors: { $className: 'badParams' } });
  }

  const users = Array.isArray(data) ? data : data.data || [ data ];
  const user = users[0];

  if (users.length !== 1) {
    throw new errors.BadRequest('More than 1 user selected.',
      { errors: { $className: 'badParams' } });
  }

  if (checks.includes('isNotVerified') && user.isVerified) {
    throw new errors.BadRequest('User is already verified.',
      { errors: { $className: 'isNotVerified' } });
  }

  if (checks.includes('isNotVerifiedOrHasVerifyChanges') &&
    user.isVerified && !Object.keys(user.verifyChanges || {}).length
  ) {
    throw new errors.BadRequest('User is already verified & not awaiting changes.',
      { errors: { $className: 'nothingToVerify' } });
  }

  if (checks.includes('isVerified') && !user.isVerified) {
    throw new errors.BadRequest('User is not verified.',
      { errors: { $className: 'isVerified' } });
  }

  if (checks.includes('verifyNotExpired') && user.verifyExpires < Date.now()) {
    throw new errors.BadRequest('Verification token has expired.',
      { errors: { $className: 'verifyExpired' } });
  }

  if (checks.includes('resetNotExpired') && user.resetExpires < Date.now()) {
    throw new errors.BadRequest('Password reset token has expired.',
      { errors: { $className: 'resetExpired' } });
  }

  return user;
};

const ensureObjPropsValid = (obj, props, allowNone) => {
  const keys = Object.keys(obj);
  const valid = keys.every(key => props.includes(key) && typeof obj[key] === 'string');
  if (!valid || (keys.length === 0 && !allowNone)) {
    throw new errors.BadRequest('User info is not valid. (authManagement)',
      { errors: { $className: 'badParams' } }
    );
  }
};

const ensureValuesAreStrings = (...rest) => {
  if (!rest.every(str => typeof str === 'string')) {
    throw new errors.BadRequest('Expected string value. (authManagement)',
      { errors: { $className: 'badParams' } }
    );
  }
};

// Verify that obj1 and obj2 have different 'field' field
// Returns false if either object is null/undefined
const ensureFieldHasChanged = (obj1, obj2) => (field) => {
  return obj1 && obj2 && obj1[field] !== obj2[field];
};

const sanitizeUserForClient = (user) => {
  const user1 = cloneObject(user);

  delete user1.password;
  delete user1.verifyExpires;
  delete user1.verifyToken;
  delete user1.verifyShortToken;
  delete user1.verifyChanges;
  delete user1.resetExpires;
  delete user1.resetToken;
  delete user1.resetShortToken;

  return user1;
};

const sanitizeUserForNotifier = user => {
  const user1 = cloneObject(user);
  delete user1.password;
  return user1;
};

/**
 * Returns new object with values cloned from the original object. Some objects
 * (like Sequelize or MongoDB model instances) contain circular references
 * and cause TypeError when trying to JSON.stringify() them. They may contain
 * custom toJSON() or toObject() method which allows to serialize them safely.
 * Object.assign() does not clone these methods, so the purpose of this method
 * is to use result of custom toJSON() or toObject() (if accessible)
 * for Object.assign(), but only in case of serialization failure.
 *
 * @param {Object?} obj - Object to clone
 * @returns {Object} Cloned object
 */
const cloneObject = obj => {
  let obj1 = obj;

  if (typeof obj.toJSON === 'function' || typeof obj.toObject === 'function') {
    try {
      JSON.stringify(Object.assign({}, obj1));
    } catch (e) {
      debug('Object is not serializable');

      obj1 = obj1.toJSON ? obj1.toJSON() : obj1.toObject();
    }
  }

  return Object.assign({}, obj1);
};

const notifier = (optionsNotifier, type, user, notifierOptions) => {
  debug('notifier', type);

  return Promise.resolve().then(() => {
    const promise = optionsNotifier(type, sanitizeUserForNotifier(user), notifierOptions || {});

    return promise && typeof promise.then === 'function' ? promise.then(() => user) : user;
  });
};

module.exports = {
  hashPassword,
  concatIDAndHash,
  deconstructId,
  comparePasswords,
  randomBytes: (...args) => randomBytes(...args), // for testing, make safe from hacking
  randomDigits: (...args) => randomDigits(...args), // for testing, make safe from hacking
  getLongToken,
  getShortToken,
  getUserData,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  ensureFieldHasChanged,
  sanitizeUserForClient,
  sanitizeUserForNotifier,
  notifier
};
