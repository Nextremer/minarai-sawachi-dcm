import * as bluebird from "bluebird";

export default class RedisPool{
  static instance;
  static getPool( config ){
    if( !RedisPool.instance ){
      RedisPool.instance = RedisPool.createPool( config );
    }
    return RedisPool.instance;
  }

  static createPool( config ){
    const redisPool = require("redis-connection-pool")("myRedisPool", {
      // optionally specify full redis url, overrides host + port properties 
      url: config.connectionString,
      max_clients: config.max_clients || 30, // default
      perform_checks: config.perform_checks || false, // checks for needed push/pop functionality 
      database: config.database || 0, // database number to use 
      options: config.options,
    });
    bluebird.promisifyAll( redisPool );
    return redisPool;
  }
}
