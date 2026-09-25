export const bullMQDefaultPrefix = "outpost";
export const bullMQDefaultStalledIntervalMs = 1000;
export const bullMQClaimBatchSize = 100;
export const bullMQConnectionTimeoutMs = 10_000;
export const bullMQConnectionRetries = 3;
export const bullMQRetryDelayMs = 100;

export const bullMQStateScript = `
local operation = ARGV[1]
local request = redis.call('HGET', KEYS[1], 'request')
if operation == 'enqueue' then
  if request and request ~= ARGV[2] then
    return redis.error_reply('Queue identity already has a different request')
  end
  if not request then
    request = ARGV[2]
    redis.call('HSET', KEYS[1], 'request', request, 'deadline', ARGV[3], 'meta', '{"status":"pending","fence":0}')
  end
end
if not request then
  if operation == 'get' then return nil end
  return redis.error_reply('Queue job does not exist')
end
local meta = cjson.decode(redis.call('HGET', KEYS[1], 'meta'))
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000 + math.floor(tonumber(clock[2]) / 1000)
local deadline = tonumber(redis.call('HGET', KEYS[1], 'deadline'))
local function live()
  return meta.status == 'pending' or meta.status == 'active'
end
local function save()
  redis.call('HSET', KEYS[1], 'meta', cjson.encode(meta))
end
if live() and deadline and deadline <= now then
  meta.status = 'cancelled'
  meta.fence = meta.fence + 1
  save()
end
local function owned()
  return meta.status == 'active' and meta.worker == ARGV[2]
    and meta.fence == tonumber(ARGV[3]) and meta.expires > now
    and redis.call('GET', KEYS[2]) == meta.token
end
local function extend(duration)
  meta.expires = now + duration
  if deadline then meta.expires = math.min(meta.expires, deadline) end
  redis.call('PEXPIRE', KEYS[2], meta.expires - now)
  redis.call('SREM', KEYS[3], ARGV[5])
end
if operation == 'claim' and live() then
  if redis.call('GET', KEYS[2]) ~= ARGV[3] then
    return redis.error_reply('Stale queue lease')
  end
  meta.status = 'active'
  meta.worker = ARGV[2]
  meta.token = ARGV[3]
  meta.fence = meta.fence + 1
  extend(tonumber(ARGV[4]))
  save()
end
if operation == 'renew' or operation == 'complete' then
  if not owned() then return redis.error_reply('Stale queue lease') end
  if operation == 'renew' then extend(tonumber(ARGV[4])) end
  if operation == 'complete' then
    meta.status = ARGV[5]
    redis.call('HSET', KEYS[1], 'result', ARGV[4])
  end
  save()
end
if operation == 'cancel' then
  if meta.fence ~= tonumber(ARGV[2]) then return redis.error_reply('Stale queue fence') end
  if live() then
    meta.status = 'cancelled'
    meta.fence = meta.fence + 1
    save()
  end
end
return {request, cjson.encode(meta), redis.call('HGET', KEYS[1], 'result') or ''}
`;
