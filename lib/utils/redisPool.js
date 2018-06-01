import * as bluebird from "bluebird";

export default class RedisPool {
  static instance;
  static getPool(config) {
    if (!RedisPool.instance) {
      RedisPool.instance = RedisPool.createPool(config);
    }
    return RedisPool.instance;
  }

  static createPool(config) {
    // config.redisMockClient に redis-mock を入れておくとそちらを優先する。
    // そうでなければ通常のRedisPoolを作る
    const redisClient = () => {
      if (config.redisMockClient === undefined) {
        return require("redis-connection-pool")("myRedisPool", {
          // optionally specify full redis url, overrides host + port properties
          url: config.connectionString,
          max_clients: config.max_clients || 30, // default
          perform_checks: config.perform_checks || false, // checks for needed push/pop functionality
          database: config.database || 0, // database number to use
          options: config.options,
        });
      } else {
        return config.redisMockClient;
      }
    };

    const client = redisClient();
    bluebird.promisifyAll(client);
    return client;
  }
}
