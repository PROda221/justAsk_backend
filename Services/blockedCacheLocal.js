const blockedCache = new Map();

function get(key) {
  return blockedCache.get(key);
}

function set(key, value, ttl) {
  blockedCache.set(key, value);
  // Set a timeout to automatically remove the cache entry after TTL
  if (ttl) {
    setTimeout(() => blockedCache.delete(key), ttl);
  }
}

function deleteKey(key) {
  blockedCache.delete(key);
}

module.exports = { get, set, deleteKey };
