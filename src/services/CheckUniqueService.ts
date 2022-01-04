import checkUnique from '../methods/check-unique';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';
import { makeDefaultOptions } from '../options';

import type {
  DataCheckUnique,
  CheckUniqueServiceOptions
} from '../types';
import { Application } from '@feathersjs/feathers';

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
      data.value,
      data.ownId,
      data.meta
    );
  }
}
