import { checkContext, getItems, replaceItems } from 'feathers-hooks-common';
import type { HookContext } from '@feathersjs/feathers';

import type { User } from '../types';

/**
 * Sanitize users. After-hook for '/users' service.
 */
export function removeVerification (
  ifReturnTokens?: boolean
): (context: HookContext) => HookContext {
  return (context: HookContext): HookContext => {
    checkContext(context, 'after');
    // Retrieve the items from the hook
    const items: User | User[] = getItems(context);
    if (!items) return;
    const isArray = Array.isArray(items);
    const users = (isArray ? items : [items]);

    users.forEach((user) => {
      if (!('isVerified' in user) && context.method === 'create') {
        /* eslint-disable no-console */
        console.warn(
          'Property isVerified not found in user properties. (removeVerification)'
        );
        console.warn(
          "Have you added authManagement's properties to your model? (Refer to README)"
        );
        console.warn(
          'Have you added the addVerification hook on users::create?'
        );
        /* eslint-enable */
      }

      if (context.params.provider && user) {
        // noop if initiated by server
        delete user.verifyExpires;
        delete user.resetExpires;
        delete user.verifyChanges;
        if (!ifReturnTokens) {
          delete user.verifyToken;
          delete user.verifyShortToken;
          delete user.resetToken;
          delete user.resetShortToken;
        }
      }
    });
    // Replace the items within the hook
    replaceItems(context, isArray ? users : users[0]);
    return context;
  };
}
