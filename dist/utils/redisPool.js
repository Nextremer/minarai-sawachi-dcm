"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _bluebird = require("bluebird");

var bluebird = _interopRequireWildcard(_bluebird);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RedisPool = function () {
  function RedisPool() {
    (0, _classCallCheck3.default)(this, RedisPool);
  }

  (0, _createClass3.default)(RedisPool, null, [{
    key: "getPool",
    value: function getPool(config) {
      if (!RedisPool.instance) {
        RedisPool.instance = RedisPool.createPool(config);
      }
      return RedisPool.instance;
    }
  }, {
    key: "createPool",
    value: function createPool(config) {
      // config.redisMockClient に redis-mock を入れておくとそちらを優先する。
      // そうでなければ通常のRedisPoolを作る
      var redisClient = function redisClient() {
        if (config.redisMockClient === undefined) {
          return require("redis-connection-pool")("myRedisPool", {
            // optionally specify full redis url, overrides host + port properties
            url: config.connectionString,
            max_clients: config.max_clients || 30, // default
            perform_checks: config.perform_checks || false, // checks for needed push/pop functionality
            database: config.database || 0, // database number to use
            options: config.options
          });
        } else {
          return config.redisMockClient;
        }
      };

      var client = redisClient();
      bluebird.promisifyAll(client);
      return client;
    }
  }]);
  return RedisPool;
}();

exports.default = RedisPool;