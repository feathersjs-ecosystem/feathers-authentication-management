
function saveHash (item, property) {
  return hash => {
    item[property] = hash;
    return item;
  };
}

module.exports = {
  saveHash
};
