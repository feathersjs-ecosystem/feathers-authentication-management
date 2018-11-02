async function () {
this.timeout(timeout);

try {
  result = await authLocalMgntService.create
} catch (err) {

}


const usersDb = [
  { _id: 'a', email: 'a', username: 'john a' },
  { _id: 'b', email: 'b', username: 'john b' },
  { _id: 'c', email: 'c', username: 'john b' },
];


try {
  await authLocalMgntService.create({
    action: 'checkUnique',
    value: { username: undefined, email: null },
  });
} catch (err) {
  assert.fail(true, false, 'test unexpectedly failed');
}


try {
  await authLocalMgntService.create({
    action: 'checkUnique',
    value: { username: 'john a', email: 'b' },
  });

  assert.fail(true, false, 'test unexpectedly succeeded');
} catch (err) {
  assert.equal(err.message, 'Values already taken.');
  assert.equal(err.errors.username, 'Already taken.');
}


