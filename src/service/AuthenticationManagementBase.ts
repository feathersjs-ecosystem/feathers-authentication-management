import { MethodNotAllowed, NotImplemented } from '@feathersjs/errors';
import { Params } from '@feathersjs/feathers';

async function callMethod<T> (self: unknown, name: string, ...args: unknown[]): Promise<T> {
  if (typeof self[name] !== 'function') {
    return await Promise.reject(new NotImplemented(`Method ${name} not available`));
  }

  return self[name](...args);
}

export class AuthenticationManagementBase<T = unknown> {
  /**
   * Create a new resource for this service, skipping any service-level hooks.
   *
   * @param data - Data to insert into this service.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#create-data-params|Feathers API Documentation: .create(data, params)}
   */
  // _create: (data: Partial<T>, params?: Params) => Promise<T>;
  publish: unknown;

  async create (data: Partial<T>, params?: Params): Promise<T> {
    if (Array.isArray(data)) {
      return await Promise.reject(new MethodNotAllowed('Can not create multiple entries'));
    }

    return await callMethod(this, '_create', data, params);
  }

  setup (): void {
    if (typeof this.publish === 'function') {
      this.publish(() => null);
    }
  }
}
