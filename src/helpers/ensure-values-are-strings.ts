
import { BadRequest } from '@feathersjs/errors';

export default function ensureValuesAreStrings (
  ...values: string[]
): void {
  if (!values.every(str => typeof str === 'string')) {
    throw new BadRequest(
      'Expected string value. (authLocalMgnt)',
      { errors: { $className: 'badParams' } }
    );
  }
}
