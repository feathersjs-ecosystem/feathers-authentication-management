
import service from './service/service';
import hooks from './hooks';

// @ts-expect-error assign object to a function
service.hooks = hooks;

export default service;
export { hooks };

// commonjs
if (typeof module !== 'undefined') {
  module.exports = Object.assign(service, module.exports);
}
