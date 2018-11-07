
const cloneObject = require('./clone-object');
const comparePasswords = require('./compare-passwords');
const concatIDAndHash = require('./concat-id-and-hash');
const deconstructId = require('./deconstruct-id');
const ensureFieldHasChanged = require('./ensure-field-has-changed');
const ensureObjPropsValid = require('./ensure-obj-props-valid');
const ensureValuesAreStrings = require('./ensure-values-are-strings');
const getLongToken = require('./get-long-token');
const getShortToken = require('./get-short-token');
const getUserData = require('./get-user-data');
const hashPassword = require('./hash-password');
const isNullsy = require('./is-nullsy');
const notifier = require('./notifier');
const randomBytes = require('./random-bytes');
const randomDigits = require('./random-digits');
const sanitizeUserForClient = require('./sanitize-user-for-client');
const sanitizeUserForNotifier = require('./sanitize-user-for-notifier');

module.exports = {
  cloneObject,
  comparePasswords,
  concatIDAndHash,
  deconstructId,
  ensureFieldHasChanged,
  ensureObjPropsValid,
  ensureValuesAreStrings,
  getLongToken,
  getShortToken,
  getUserData,
  hashPassword,
  isNullsy,
  notifier,
  randomBytes: (...args) => randomBytes(...args), // for testing, make safe from hacking
  randomDigits: (...args) => randomDigits(...args), // for testing, make safe from hacking
  sanitizeUserForClient,
  sanitizeUserForNotifier
};
