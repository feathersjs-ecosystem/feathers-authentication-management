
const cloneObject = require('./clone-object');

module.exports = sanitizeUserForNotifier;

function sanitizeUserForNotifier (user1) {
  const user = cloneObject(user1);
  delete user.password;
  return user;
}
