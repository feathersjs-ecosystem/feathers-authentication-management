
/* eslint-env node */
/* eslint no-param-reassign: 0 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');
const debug = require('debug')('verify-reset:helpers');

let options = {};

const helpersInit = options1 => {
  options = options1;
};

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

const getLongToken = len => randomBytes(len || options.longTokenLen);

const getShortToken = (len, ifDigits) => {
  len = len || options.shortTokenLen;

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
    throw new errors.BadRequest('User not found.', { errors: { $className: 'badParams' } });
  }

  const users = Array.isArray(data) ? data : data.data;
  const user = users[0];

  if (users.length !== 1) {
    throw new errors.BadRequest('More than 1 user selected.',
      { errors: { $className: 'badParams' } });
  }

  if (checks.indexOf('isNotVerified') !== -1 && user.isVerified) {
    throw new errors.BadRequest('User is already verified.',
      { errors: { $className: 'isNotVerified' } });
  }
  
  if (checks.includes('isNotVerifiedOrHasVerifyChanges') &&
    user.isVerified && !Object.keys(user.verifyChanges || {}).length
  ) {
    throw new errors.BadRequest('User is already verified & not awaiting changes.',
      { errors: { $className: 'isNotVerified' } });
  }

  if (checks.indexOf('isVerified') !== -1 && !user.isVerified) {
    throw new errors.BadRequest('User is not verified.',
      { errors: { $className: 'isVerified' } });
  }

  if (checks.indexOf('verifyNotExpired') !== -1 && user.verifyExpires < Date.now()) {
    throw new errors.BadRequest('Verification token has expired.',
      { errors: { $className: 'verifyExpired' } });
  }

  if (checks.indexOf('resetNotExpired') !== -1 && user.resetExpires < Date.now()) {
    throw new errors.BadRequest('Password reset token has expired.',
      { errors: { $className: 'resetExpired' } });
  }

  return user;
};

const ensureObjPropsValid = (obj, props, allowNone) => {
  const keys = Object.keys(obj);
  const valid = keys.every(key => props.indexOf(key) !== -1 && typeof obj[key] === 'string');
  if (!valid || (keys.length === 0 && !allowNone)) {
    throw new errors.BadRequest(
      'User info is not valid. (verify-reset)', { errors: { $className: 'badParams' } }
    );
  }
};

const ensureValuesAreStrings = (...rest) => {
  if (!rest.every(str => typeof str === 'string')) {
    throw new errors.BadRequest(
      'Expected string value. (verify-reset)', { errors: { $className: 'badParams' } }
    );
  }
};

const sanitizeUserForClient = user => {
  const user1 = Object.assign({}, user);

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
  const user1 = Object.assign({}, user);
  delete user1.password;
  return user1;
};

const notifier = (optionsNotifier, type, user, notifierOptions) => {
  debug('notifier', type);

  return Promise.resolve().then(() => {
    const promise = optionsNotifier(type, sanitizeUserForNotifier(user), notifierOptions || {});

    return promise && typeof promise.then === 'function' ? promise.then(() => user) : user;
  });
};

module.exports = {
  helpersInit,
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
