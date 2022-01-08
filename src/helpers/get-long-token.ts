import { randomBytes } from './random-bytes';

export const getLongToken = async (len: number): Promise<string> => await randomBytes(len);
