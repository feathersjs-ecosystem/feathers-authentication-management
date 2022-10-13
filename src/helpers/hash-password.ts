import { hooks as authLocalHooks } from '@feathersjs/authentication-local';
import type { Application, HookContext } from '@feathersjs/feathers';

export async function hashPassword (
  app: Application,
  password: string,
  field: string
): Promise<string> {
  if (!field) throw new Error('Field is missing');
  const context = {
    type: 'before',
    data: { [field]: password },
    params: { provider: null },
    app
  };
  await authLocalHooks.hashPassword(field)(context as HookContext);
  return context.data[field];
}
