
const bcrypt = require('bcryptjs');

module.exports = comparePasswords;

function comparePasswords (oldPassword, password, getError) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(oldPassword, password, (err, data1) =>
      (err || !data1) ? reject(getError() || err) : resolve()
    );
  });
}
