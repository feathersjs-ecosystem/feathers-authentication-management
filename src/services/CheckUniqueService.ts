import checkUnique from '../methods/check-unique';
import { makeDefaultOptions } from '../options';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';
import type { Application } from '@feathersjs/feathers';

import type {
  DataCheckUnique,
  CheckUniqueServiceOptions
} from '../types';

export class CheckUniqueService
  extends AuthenticationManagementBase<DataCheckUnique, null, CheckUniqueServiceOptions> {
  constructor (app: Application, options?: Partial<CheckUniqueServiceOptions>) {
    super(app);

    const defaultOptions = makeDefaultOptions(['service']);
    this.options = Object.assign(defaultOptions, options);
  }

  async _create (data: DataCheckUnique): Promise<null> {
    return await checkUnique(
      this.optionsWithApp,
      data.user,
      data.ownId,
      data.meta
    );
  }
}
