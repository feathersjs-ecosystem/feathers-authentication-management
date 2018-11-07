
const cloneObject = require('./clone-object');

module.exports = sanitizeUserForClient;

function sanitizeUserForClient (user1) {
  const user = cloneObject(user1);

  delete user.password;
  delete user.verifyExpires;
  delete user.verifyToken;
  delete user.verifyShortToken;
  delete user.verifyChanges;
  delete user.resetExpires;
  delete user.resetToken;
  delete user.resetShortToken;

  return user;
}
