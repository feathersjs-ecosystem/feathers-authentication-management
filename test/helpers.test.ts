import assert from 'assert';
import feathers from '@feathersjs/feathers';
import feathersMemory from 'feathers-memory';
import authLocalMgnt from '../src/index';
import helpers from '../src/helpers';
import { User } from '../src/types';
import { addSeconds } from "date-fns"

const makeUsersService = options =>
  function (app) {
    Object.assign(options, { multi: true });
    app.use('/users', feathersMemory(options));
  };

const users_Id = [
  { _id: 'a', email: 'a', username: 'john a', sensitiveData: 'some secret' }
];

describe('helpers.test.ts', () => {
  describe("sanitization", () => {
    it('allows to stringify sanitized user object', () => {
      const user: Partial<User> = {
        id: 1,
        email: 'test@test.test',
        password: '0000000000',
        resetToken: 'aaa'
      };

      //@ts-ignore
      const result1 = helpers.sanitizeUserForClient(user);
      //@ts-ignore
      const result2 = helpers.sanitizeUserForNotifier(user);

      assert.doesNotThrow(() => JSON.stringify(result1));
      assert.doesNotThrow(() => JSON.stringify(result2));
    });

    it('throws error when stringifying sanitized object with circular reference', () => {
      const user = {
        id: 1,
        email: 'test@test.test',
        password: '0000000000',
        resetToken: 'aaa'
      };

      //@ts-ignore
      user.self = user;

      //@ts-ignore
      const result1 = helpers.sanitizeUserForClient(user);
      //@ts-ignore
      const result2 = helpers.sanitizeUserForNotifier(user);

      assert.throws(() => JSON.stringify(result1), TypeError);
      assert.throws(() => JSON.stringify(result2), TypeError);
    });

    it('allows to stringify sanitized object with circular reference and custom toJSON()', () => {
      const user = {
        id: 1,
        email: 'test@test.test',
        password: '0000000000',
        resetToken: 'aaa',
        toJSON: function () {
          return Object.assign({}, this, { self: undefined });
        }
      };

      //@ts-ignore
      user.self = user;

      //@ts-ignore
      const result1 = helpers.sanitizeUserForClient(user);
      //@ts-ignore
      const result2 = helpers.sanitizeUserForNotifier(user);

      assert.doesNotThrow(() => JSON.stringify(result1));
      assert.doesNotThrow(() => JSON.stringify(result2));
    });

    it('allows to stringify sanitized object with circular reference and custom toObject()', () => {
      const user = {
        id: 1,
        email: 'test@test.test',
        password: '0000000000',
        resetToken: 'aaa',
        toObject: function () {
          return Object.assign({}, this, { self: undefined });
        }
      };

      //@ts-ignore
      user.self = user;

      //@ts-ignore
      const result1 = helpers.sanitizeUserForClient(user);
      //@ts-ignore
      const result2 = helpers.sanitizeUserForNotifier(user);

      assert.doesNotThrow(() => JSON.stringify(result1));
      assert.doesNotThrow(() => JSON.stringify(result2));
    });

    it('allows for customized sanitize function', async () => {
      const app = feathers();
      app.configure(makeUsersService({ id: '_id' }));
      app.configure(
        authLocalMgnt({
          sanitizeUserForClient: customSanitizeUserForClient
        })
      );
      app.setup();
      const authManagement = app.service('authManagement');

      const usersService = app.service('users');
      await usersService.remove(null);
      await usersService.create(users_Id);

      const result = await authManagement.create({
        action: 'resendVerifySignup',
        value: { email: 'a' }
      });

      assert.strictEqual(result.sensitiveData, undefined);
    });
  })

  it("deconstructId", () => {
    const id = helpers.deconstructId("123___456");
    assert.strictEqual(id, "123", "extracts id");

    assert.throws(
      () => helpers.deconstructId("this is__a test")
    )
  });

  it("ensureFieldHasChanges", () => {
    const ensureForNulls = helpers.ensureFieldHasChanged(null, null);
    assert.ok(!ensureForNulls('password'), "returns false for nulls");

    const ensureForChanged = helpers.ensureFieldHasChanged({ password: "1" }, { password: "2" });
    assert.ok(ensureForChanged('password'), "changed password");

    const ensureForUnchanged = helpers.ensureFieldHasChanged({ password: "1" }, { password: "1" });
    assert.ok(ensureForChanged('password'), "password did not change")
  });

  it("ensureValuesAreStrings", () => {
    assert.doesNotThrow(
      () => helpers.ensureValuesAreStrings(),
      "does not throw on empty array"
    )

    assert.doesNotThrow(
      () => helpers.ensureValuesAreStrings("1", "2", "3"),
      "does not throw on string array"
    )

    assert.throws(
      // @ts-expect-error anything other than string is not allowed
      () => helpers.ensureValuesAreStrings("1", "2", 3),
      "throws on mixed array"
    )
  })

  describe("getUserData", () => {
    it("throws with no users", () => {
      assert.throws(
        () => helpers.getUserData([])
      );

      assert.throws(
        () => helpers.getUserData({ data: [], limit: 10, skip: 0, total: 0 })
      )
    })

    it("throws with users > 1", () => {
      assert.throws(
        () => helpers.getUserData([
          // @ts-expect-error some props missing
          { id: 1, email: "test@test.de" },
          // @ts-expect-error some props missing
          { id: 2, email: "test2@test.de" }
        ])
      )

      assert.throws(
        () => helpers.getUserData({
          data: [
            // @ts-expect-error some props missing
            { id: 1, email: "test@test.de" },
            // @ts-expect-error some props missing
            { id: 2, email: "test2@test.de" }
          ],
          limit: 10,
          skip: 0,
          total: 2
      })
      )
    });
  });

  it("hashPassword", async () => {
    let rejected = false;
    try {
      // @ts-expect-error field is missing
      await helpers.hashPassword(feathers(), "123")
    } catch {
      rejected = true;
    }

    assert.ok(rejected, "rejected");
  })

  it("isDateAfterNow", () => {
    const now = new Date();
    const nowPlus1 = addSeconds(now, 1);

    assert.ok(helpers.isDateAfterNow(nowPlus1.getTime()), "unix is after now");
    assert.ok(helpers.isDateAfterNow(nowPlus1), "date obj is after now");

    assert.ok(!helpers.isDateAfterNow(now.getTime()), "now as unix returns false")
    assert.ok(!helpers.isDateAfterNow(now), "now as date obj returns false")

    assert.ok(helpers.isDateAfterNow(now.getTime(), -1000), "now as unix with delay returns true");
    assert.ok(helpers.isDateAfterNow(now, -1000), "now as date obj with delay returns true");
  })
});

function customSanitizeUserForClient (user) {
  const user1 = helpers.sanitizeUserForClient(user);
  delete user1.sensitiveData;
  return user1;
}
