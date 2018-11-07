
const makeDebug = require('debug');
const sanitizeUserForNotifier = require('./sanitize-user-for-notifier');

const debug = makeDebug('authLocalMgnt:notifier');

module.exports = notifier;

async function notifier (optionsNotifier, type, user, notifierOptions) {
  debug('notifier', type);
  await optionsNotifier(type, sanitizeUserForNotifier(user), notifierOptions || {});
  return user;
}
