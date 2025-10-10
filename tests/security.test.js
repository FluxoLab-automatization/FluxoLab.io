const test = require('node:test');
const assert = require('node:assert/strict');

process.env.TOKEN_HASH_SECRET = 'unit-test-secret';

const { hashToken, maskToken } = require('../lib/security');

test('hashToken is deterministic and sensitive to input', () => {
  const hashA1 = hashToken('abc');
  const hashA2 = hashToken('abc');
  const hashB = hashToken('abcd');

  assert.equal(hashA1, hashA2);
  assert.notEqual(hashA1, hashB);
  assert.match(hashA1, /^[a-f0-9]{64}$/);
});

test('maskToken hides middle part', () => {
  const masked = maskToken('1234567890abcdef');
  assert.equal(masked, '123456***cdef');
});
