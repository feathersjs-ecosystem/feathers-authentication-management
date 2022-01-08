import { randomBytes as _randomBytes } from 'crypto';

export async function randomBytes (
  len: number
): Promise<string> {
  return await new Promise((resolve, reject) => {
    _randomBytes(len, (err, buf) => err ? reject(err) : resolve(buf.toString('hex')));
  });
}
