import { compare } from 'bcryptjs';

export async function comparePasswords (
  oldPassword: string,
  password: string,
  getError?: () => unknown
): Promise<void> {
  return await new Promise((resolve, reject) => {
    compare(oldPassword, password, (err, data) =>
      (err || !data) ? reject(getError?.() ?? err) : resolve()
    );
  });
}
