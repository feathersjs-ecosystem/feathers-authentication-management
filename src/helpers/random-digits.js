
const crypto = require('crypto');

module.exports = randomDigits;

function randomDigits (len) {
  let str = '';

  while (str.length < len) {
    str += parseInt('0x' + crypto.randomBytes(4).toString('hex')).toString();
  }

  return str.substr(0, len);
}
