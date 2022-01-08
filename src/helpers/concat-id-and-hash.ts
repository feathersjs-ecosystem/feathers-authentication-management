import type { Id } from '@feathersjs/feathers';

export function concatIDAndHash (
  id: Id,
  token: string
): string {
  return `${id}___${token}`;
}
