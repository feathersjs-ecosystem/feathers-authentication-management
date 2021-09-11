import { defaultVerifyDelay } from './config';

function makeDateTime (
  options?: { delay?: number }
): number {
  options = options || {};
  return Date.now() + (options.delay || defaultVerifyDelay);
}

export default makeDateTime;
