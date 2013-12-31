
--- <key> <bins> <val>

local key = KEYS[1]
local bins = tonumber(ARGV[1])
local val = tonumber(ARGV[2])
local aux = key .. ':aux'

local min = tonumber(redis.call('hget', aux, 'min')) or math.huge
local max = tonumber(redis.call('hget', aux, 'max')) or 0

if val < min then
  min = val
end

if val > max then
  max = val
end

redis.call('hset', aux, 'min', min)
redis.call('hset', aux, 'max', max)

local d = max - min
local p = (val - min) / d
local b = math.max(0, math.floor(bins * p) - 1)

redis.call('hincrby', key, b, 1)