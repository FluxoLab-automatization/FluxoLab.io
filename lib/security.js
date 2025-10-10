const crypto = require('crypto');

function getTokenSecret() {
  return (
    process.env.TOKEN_HASH_SECRET ||
    process.env.APP_SECRET ||
    'local-dev-pepper'
  );
}

function hashToken(token) {
  if (!token) {
    throw new Error('Token value is required to compute the hash');
  }
  return crypto
    .createHmac('sha256', getTokenSecret())
    .update(token)
    .digest('hex');
}

function maskToken(token) {
  if (!token || token.length < 10) {
    return 'hidden';
  }
  return `${token.slice(0, 6)}***${token.slice(-4)}`;
}

function ensureLeadingSlash(pathValue) {
  if (!pathValue) {
    return '/';
  }
  let result = pathValue.trim();
  if (!result.startsWith('/')) {
    result = `/${result}`;
  }
  if (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1);
  }
  return result;
}

module.exports = {
  hashToken,
  maskToken,
  ensureLeadingSlash,
};
