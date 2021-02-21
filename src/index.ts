import configure from './configureAuthManagement';
import hooks from './hooks';

// @ts-expect-error assign object to a function
configure.hooks = hooks;

export default configure;
export { hooks };

// commonjs
if (typeof module !== 'undefined') {
  module.exports = Object.assign(configure, module.exports);
}
