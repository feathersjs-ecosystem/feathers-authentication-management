import checkUnique from '../check-unique';
import { DataCheckUnique, CheckUniqueOptions } from '../types';
import { AuthenticationManagementBase } from './AuthenticationManagementBase';

export class CheckUniqueService extends AuthenticationManagementBase {
  options: CheckUniqueOptions;

  constructor (options: CheckUniqueOptions) {
    super();
    this.options = options;
  }

  async _create (data: DataCheckUnique): Promise<null> {
    return await checkUnique(
      this.options,
      data.value,
      data.ownId ?? null,
      data.meta ?? {}
    );
  }
}
