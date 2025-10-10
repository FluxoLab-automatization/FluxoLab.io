process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fluxolab_test';

const test = require('node:test');
const assert = require('node:assert/strict');

const authenticate = require('../middleware/authenticate');

test('extractBearerToken handles valid header', () => {
  const token = authenticate._extractBearerToken('Bearer abc.def');
  assert.equal(token, 'abc.def');
});

test('extractBearerToken returns empty for invalid scheme', () => {
  const token = authenticate._extractBearerToken('Basic abc');
  assert.equal(token, '');
});

test('extractBearerToken trims spaces', () => {
  const token = authenticate._extractBearerToken('Bearer    token123   ');
  assert.equal(token, 'token123');
});
