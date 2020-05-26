const makeDebug = require('debug');
const concatIDAndHash = require('./helpers/concat-id-and-hash');
const ensureObjPropsValid = require('./helpers/ensure-obj-props-valid');
const getLongToken = require('./helpers/get-long-token');
const getShortToken = require('./helpers/get-short-token');
const getUserData = require('./helpers/get-user-data');
const hashPassword = require('./helpers/hash-password');
const notifier = require('./helpers/notifier');

const debug = makeDebug('authLocalMgnt:sendResetPwd');

module.exports = sendResetPwd;

async function sendResetPwd (options, identifyUser, notifierOptions, field) {
  debug('sendResetPwd');
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  const users = await usersService.find({ query: identifyUser });
  const user1 = getUserData(users, options.skipIsVerifiedCheck ? [] : ['isVerified']);

  const user2 = Object.assign(user1, {
    resetExpires: Date.now() + options.resetDelay,
    resetToken: concatIDAndHash(user1[usersServiceIdName], await getLongToken(options.longTokenLen)),
    resetShortToken: await getShortToken(options.shortTokenLen, options.shortTokenDigits)
  });

  notifier(options.notifier, 'sendResetPwd', user2, notifierOptions);
  const user3 = await usersService.patch(user2[usersServiceIdName], {
    resetExpires: user2.resetExpires,
    resetToken: await hashPassword(options.app, user2.resetToken, field),
    resetShortToken: await hashPassword(options.app, user2.resetShortToken, field)
  });

  return options.sanitizeUserForClient(user3);
}
