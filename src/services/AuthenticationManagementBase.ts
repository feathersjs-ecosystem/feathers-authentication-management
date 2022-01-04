import { MethodNotAllowed } from '@feathersjs/errors';
import type { Application, Params } from '@feathersjs/feathers';

export abstract class AuthenticationManagementBase<T, R, O> {
  publish: unknown;
  app: Application;
  options: O;

  abstract _create (data: T, params?: Params): Promise<R>;

  constructor(app: Application) {
    if (!app) {
      throw new Error("Service from 'feathers-authentication-management' needs the 'app' as first constructor argument");
    }

    this.app = app;
  }

  async create (data: T, params?: Params): Promise<R> {
    if (Array.isArray(data)) {
      return await Promise.reject(
        new MethodNotAllowed('authManagement does not handle multiple entries')
      );
    }

    return await this._create(data, params);
  }

  protected get optionsWithApp() {
    return Object.assign({ app: this.app }, this.options);
  }

  setup (): void {
    if (typeof this.publish === 'function') {
      this.publish(() => null);
    }
  }
}
