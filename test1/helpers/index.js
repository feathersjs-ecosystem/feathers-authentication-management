module.exports.saveHash = function saveHash (item, property) {
  return function (hash) {
    item[property] = hash;
    return item;
  };
};
