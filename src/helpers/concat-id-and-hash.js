"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function concatIDAndHash(id, token) {
    return id + "___" + token;
}
exports.default = concatIDAndHash;
