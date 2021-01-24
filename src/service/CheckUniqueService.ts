import checkUnique from '../check-unique';
import { DataCheckUnique, CheckUniqueOptions } from '../types';

export class CheckUniqueService {
  options: CheckUniqueOptions;

  constructor (options: CheckUniqueOptions) {
    this.options = options;
  }

  async create (data: DataCheckUnique): Promise<null> {
    return await checkUnique(
      this.options,
      data.value,
      data.ownId ?? null,
      data.meta ?? {}
    );
  }
}
