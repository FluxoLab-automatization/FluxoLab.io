const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'auth-test-secret';
process.env.JWT_EXPIRES_IN = '1h';

const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} = require('../lib/auth');

test('hashPassword generates verifiable hash', async () => {
  const password = 'Sup3rSenha!';
  const hash = await hashPassword(password);

  assert.ok(hash);
  assert.notEqual(hash, password);

  const matches = await comparePassword(password, hash);
  assert.equal(matches, true);

  const wrong = await comparePassword('outraSenha', hash);
  assert.equal(wrong, false);
});

test('generateToken embeds payload', () => {
  const token = generateToken({ sub: 'user-123', email: 'teste@fluxolab.dev' });
  const decoded = verifyToken(token);

  assert.equal(decoded.sub, 'user-123');
  assert.equal(decoded.email, 'teste@fluxolab.dev');
});
