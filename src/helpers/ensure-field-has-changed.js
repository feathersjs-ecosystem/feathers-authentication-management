
const isNullsy = require('./is-nullsy');

module.exports = ensureFieldHasChanged;

// Verify that obj1 and obj2 have different 'field' field
// Returns false if either object is null/undefined
function ensureFieldHasChanged (obj1, obj2) {
  return isNullsy(obj1) || isNullsy(obj2)
    ? () => false
    : field => obj1[field] !== obj2[field];
}
