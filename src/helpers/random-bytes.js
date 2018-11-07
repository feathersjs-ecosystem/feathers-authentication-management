
const crypto = require('crypto');

module.exports = randomBytes;

function randomBytes (len) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(len, (err, buf) => err ? reject(err) : resolve(buf.toString('hex')));
  });
}
