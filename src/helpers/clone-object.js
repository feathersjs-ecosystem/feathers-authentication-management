"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns new object with values cloned from the original object. Some objects
 * (like Sequelize or MongoDB model instances) contain circular references
 * and cause TypeError when trying to JSON.stringify() them. They may contain
 * custom toJSON() or toObject() method which allows to serialize them safely.
 * Object.assign() does not clone these methods, so the purpose of this method
 * is to use result of custom toJSON() or toObject() (if accessible)
 * for Object.assign(), but only in case of serialization failure.
 *
 * @param {Object?} obj - Object to clone
 * @returns {Object} Cloned object
 */
function cloneObject(obj) {
    var obj1 = obj;
    if (typeof obj.toJSON === 'function' || typeof obj.toObject === 'function') {
        try {
            JSON.stringify(Object.assign({}, obj1));
        }
        catch (err) {
            obj1 = obj1.toJSON ? obj1.toJSON() : obj1.toObject();
        }
    }
    return Object.assign({}, obj1);
}
exports.default = cloneObject;
