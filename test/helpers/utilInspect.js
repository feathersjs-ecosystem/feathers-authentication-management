
const spyNotifier = () => {};

const util = require('util');
console.log('called with\n', util.inspect(
  spyNotifier.result()[0].args,
  { depth: 5, colors: true }
));
console.log('should be\n', util.inspect(
  'a'
  ,
  { depth: 5, colors: true }
));
