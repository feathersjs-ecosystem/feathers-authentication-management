import configure from './configureAuthManagement';
import hooks from './hooks';
import services from './services';

// @ts-expect-error assign object to a function
configure.hooks = hooks;
// @ts-expect-error assign object to a function
configure.services = services;

export default configure;
export { hooks };
export { services };

// commonjs
if (typeof module !== 'undefined') {
  module.exports = Object.assign(configure, module.exports);
}
