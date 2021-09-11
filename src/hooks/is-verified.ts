
import { BadRequest } from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';

import type { HookContext } from '@feathersjs/feathers';

/**
 * Throws if `context.params?.user?.isVerified` is not true
 */
export default function isVerified (): ((context: HookContext) => HookContext) {
  return (context: HookContext): HookContext => {
    checkContext(context, 'before');

    if (!context.params?.user?.isVerified) {
      throw new BadRequest('User\'s email is not yet verified.');
    }
    return context;
  };
}
