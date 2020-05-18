const errors = require("@feathersjs/errors");
const makeDebug = require("debug");
const ensureObjPropsValid = require("./helpers/ensure-obj-props-valid");
const ensureValuesAreStrings = require("./helpers/ensure-values-are-strings");
const getUserData = require("./helpers/get-user-data");
const hashPassword = require("./helpers/hash-password");
const notifier = require("./helpers/notifier");

const debug = makeDebug("authLocalMgnt:verifySignupSetPassword");

module.exports = {
  verifySignupSetPasswordWithLongToken,
  verifySignupSetPasswordWithShortToken,
};

async function verifySignupSetPasswordWithLongToken(
  options,
  verifyToken,
  password
) {
  ensureValuesAreStrings(verifyToken, password);

  return await verifySignupSetPassword(
    options,
    { verifyToken },
    { verifyToken },
    password
  );
}

async function verifySignupSetPasswordWithShortToken(
  options,
  verifyShortToken,
  identifyUser,
  password
) {
  ensureValuesAreStrings(verifyShortToken, password);
  ensureObjPropsValid(identifyUser, options.identifyUserProps);

  return await verifySignupSetPassword(
    options,
    identifyUser,
    {
      verifyShortToken,
    },
    password
  );
}

async function verifySignupSetPassword(options, query, tokens, password) {
  debug("verifySignupSetPassword", query, tokens, password);
  const usersService = options.app.service(options.service);
  const usersServiceIdName = usersService.id;

  const users = await usersService.find({ query });
  const user1 = getUserData(users, [
    "isNotVerifiedOrHasVerifyChanges",
    "verifyNotExpired",
  ]);

  if (!Object.keys(tokens).every((key) => tokens[key] === user1[key])) {
    await eraseVerifyPropsSetPassword(user1, user2.isVerified, {}, password);

    throw new errors.BadRequest(
      "Invalid token. Get for a new one. (authLocalMgnt)",
      { errors: { $className: "badParam" } }
    );
  }

  const user2 = await eraseVerifyPropsSetPassword(
    user1,
    user1.verifyExpires > Date.now(),
    user1.verifyChanges || {},
    password
  );

  const user3 = await notifier(options.notifier, "verifySignupSetPassword", user2);
  return options.sanitizeUserForClient(user3);

  async function eraseVerifyPropsSetPassword(user, isVerified, verifyChanges, password) {
    const hashedPassword = await hashPassword(options.app, password);

    const patchToUser = Object.assign({}, verifyChanges || {}, {
      isVerified,
      verifyToken: null,
      verifyShortToken: null,
      verifyExpires: null,
      verifyChanges: {},
      password: hashedPassword,
    });

    return await usersService.patch(user[usersServiceIdName], patchToUser, {});
  }
}
