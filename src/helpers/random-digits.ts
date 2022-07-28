import { randomBytes } from 'crypto';

export function randomDigits (len: number): string {
  let str = '';

  while (str.length < len) {
    str += parseInt('0x' + randomBytes(4).toString('hex')).toString();
  }

  return str.substr(0, len);
}
