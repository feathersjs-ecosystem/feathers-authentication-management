import {
  randomBytes as _randomBytes
} from 'crypto';

export function randomDigits (len: number): string {
  let str = '';

  while (str.length < len) {
    str += parseInt('0x' + _randomBytes(4).toString('hex')).toString();
  }

  return str.substr(0, len);
}

export async function randomBytes (
  len: number
): Promise<string> {
  return await new Promise((resolve, reject) => {
    _randomBytes(len, (err, buf) => err ? reject(err) : resolve(buf.toString('hex')));
  });
}

export const getLongToken = async (len: number): Promise<string> => await randomBytes(len);

export async function getShortToken (
  len: number,
  ifDigits: boolean
): Promise<string> {
  if (ifDigits) {
    return randomDigits(len);
  }

  const str1 = await randomBytes(Math.floor(len / 2) + 1);
  let str = str1.substr(0, len);

  if (str.match(/^[0-9]+$/)) { // tests will fail on all digits
    str = `q${str.substr(1)}`; // shhhh, secret.
  }

  return str;
}
