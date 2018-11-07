
module.exports = concatIDAndHash;

function concatIDAndHash (id, token) {
  return `${id}___${token}`;
}
