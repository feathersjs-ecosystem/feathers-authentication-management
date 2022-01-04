import { GeneralError } from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';
import getLongToken from '../helpers/get-long-token';
import getShortToken from '../helpers/get-short-token';
import ensureFieldHasChanged from '../helpers/ensure-field-has-changed';
import { defaultPath } from '../options';

import type { HookContext } from '@feathersjs/feathers';
import type { AuthenticationManagementService } from '../services';

/**
 *
 * @param [path='authManagement'] the servicePath for your authManagement service
 * @returns
 */
export default function addVerification (
  path?: string
): ((context: HookContext) => Promise<HookContext>) {
  path = path || defaultPath; // default: 'authManagement'
  return async (context: HookContext): Promise<HookContext> => {
    checkContext(context, 'before', ['create', 'patch', 'update']);

    try {
      const { options } = (context.app.service(path) as AuthenticationManagementService);

      if (
        (context.method === 'patch' || context.method === 'update') &&
        !!context.params.user &&
        !options.identifyUserProps.some(ensureFieldHasChanged(context.data, context.params.user))
      ) {
        return context;
      }

      const [longToken, shortToken] = await Promise.all([
        getLongToken(options.longTokenLen),
        getShortToken(options.shortTokenLen, options.shortTokenDigits)
      ]);

      context.data.isVerified = false;
      context.data.verifyExpires = Date.now() + options.delay;
      context.data.verifyToken = longToken;
      context.data.verifyShortToken = shortToken;
      context.data.verifyChanges = {};

      return context;
    } catch (err) {
      throw new GeneralError(err);
    }
  };
}
