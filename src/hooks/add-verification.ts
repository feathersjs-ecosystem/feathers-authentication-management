import { GeneralError } from '@feathersjs/errors';
import { checkContext } from 'feathers-hooks-common';
import {
  getLongToken,
  getShortToken,
  ensureFieldHasChanged
} from '../helpers';
import { defaultPath } from '../options';

import type { HookContext } from '@feathersjs/feathers';
import type { AuthenticationManagementService } from '../services';

/**
 *
 * @param [path='authManagement'] the servicePath for your authManagement service
 * @returns
 */
export function addVerification <H extends HookContext = HookContext>(
  path?: string
) {
  path = path || defaultPath; // default: 'authManagement'
  return async (context: H): Promise<H> => {
    checkContext(context, 'before', ['create', 'patch', 'update']);

    try {
      const { options } = (context.app.service(path) as unknown as AuthenticationManagementService);

      const dataArray = (Array.isArray(context.data))
        ? context.data
        : [context.data];

      if (
        (['patch', 'update'].includes(context.method)) &&
          !!context.params.user &&
          dataArray.some(data => {
            return !options.identifyUserProps.some(ensureFieldHasChanged(data, context.params.user));
          })
      ) {
        return context;
      }

      await Promise.all(
        dataArray.map(async data => {
          const [longToken, shortToken] = await Promise.all([
            getLongToken(options.longTokenLen),
            getShortToken(options.shortTokenLen, options.shortTokenDigits)
          ]);

          data.isVerified = false;
          data.verifyExpires = Date.now() + options.delay;
          data.verifyToken = longToken;
          data.verifyShortToken = shortToken;
          data.verifyChanges = {};
        })
      );

      return context;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new GeneralError(err?.message);
    }
  };
}
