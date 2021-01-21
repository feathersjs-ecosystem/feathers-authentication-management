"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a = require('feathers-hooks-common'), checkContext = _a.checkContext, getItems = _a.getItems, replaceItems = _a.replaceItems;
function removeVerification(ifReturnTokens) {
    return function (hook) {
        checkContext(hook, 'after');
        // Retrieve the items from the hook
        var users = getItems(hook);
        if (!users)
            return;
        var isArray = Array.isArray(users);
        users = (isArray ? users : [users]);
        users.forEach(function (user) {
            if (!('isVerified' in user) && hook.method === 'create') {
                /* eslint-disable no-console */
                console.warn('Property isVerified not found in user properties. (removeVerification)');
                console.warn('Have you added authManagement\'s properties to your model? (Refer to README.md)');
                console.warn('Have you added the addVerification hook on users::create?');
                /* eslint-enable */
            }
            if (hook.params.provider && user) { // noop if initiated by server
                delete user.verifyExpires;
                delete user.resetExpires;
                delete user.verifyChanges;
                if (!ifReturnTokens) {
                    delete user.verifyToken;
                    delete user.verifyShortToken;
                    delete user.resetToken;
                    delete user.resetShortToken;
                }
            }
        });
        // Replace the items within the hook
        replaceItems(hook, isArray ? users : users[0]);
    };
}
exports.default = removeVerification;
