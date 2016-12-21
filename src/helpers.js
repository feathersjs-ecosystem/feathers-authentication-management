
/* eslint-env node */
/* eslint no-param-reassign: 0 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');
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
  const str = Math.random().toString() + Array(len + 1).join('0');
  return str.substr(2, len);
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

  const users = Array.isArray(data) ? data : data.data;
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

const sanitizeUserForClient = user => {
  const user1 = cloneUserObject(user);

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
  const user1 = cloneUserObject(user);
  delete user1.password;
  return user1;
};

/**
 * Returns new object with values cloned from original user object.
 * Some objects (like Sequelize model instances) contain circular references
 * and cause TypeError when trying to JSON.stringify() them. They may contain
 * custom toJSON() method which allows to serialize them safely.
 * Object.assign() does not clone original toJSON(), so the purpose of this method
 * is to use result of custom toJSON() (if accessible) for Object.assign(),
 * but only in case of serialization failure.
 *
 * @param {Object?} user - Object to clone
 * @returns {Object} Cloned user object
 */
const cloneUserObject = user => {
  let user1 = user;

  if (typeof user.toJSON === 'function') {
    try {
      JSON.stringify(Object.assign({}, user1));
    } catch (e) {
      debug('User object is not serializable');

      user1 = user1.toJSON();
    }
  }

  return Object.assign({}, user1);
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
  comparePasswords,
  randomBytes: (...args) => randomBytes(...args), // for testing, make safe from hacking
  randomDigits: (...args) => randomDigits(...args), // for testing, make safe from hacking
  getLongToken,
  getShortToken,
  getUserData,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  sanitizeUserForClient,
  sanitizeUserForNotifier,
  notifier
};
