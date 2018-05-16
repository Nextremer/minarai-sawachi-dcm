"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConditionMap = undefined;

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _redisPool = require("../utils/redisPool");

var _redisPool2 = _interopRequireDefault(_redisPool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rp = require("request-promise");

var ConditionMap = exports.ConditionMap = function () {
  (0, _createClass3.default)(ConditionMap, null, [{
    key: "getInstance",
    value: function getInstance(applicationId, conditionMapOptions, redisConfig) {
      return new ConditionMap(applicationId, conditionMapOptions, redisConfig);
    }

    //TODO: BluebirdのRedisでキーの存在チェックできる？

  }]);

  function ConditionMap(applicationId, conditionMapOptions, redisConfig) {
    (0, _classCallCheck3.default)(this, ConditionMap);
    this.map = null;

    if (applicationId === undefined || applicationId === null || applicationId === "") {
      throw new Error("applicationId is invalid: " + applicationId);
    }

    conditionMapOptions.applicationId = applicationId;
    conditionMapOptions.redis = redisConfig;

    this.source = this._sourceSelector(conditionMapOptions);
    this.fetchForEachRequest = conditionMapOptions.fetchForEachRequest;
  }

  (0, _createClass3.default)(ConditionMap, [{
    key: "_sourceSelector",
    value: function _sourceSelector(conditionMapOptions) {
      var source = conditionMapOptions.source;
      if (source === "json") return new MapResourceJson(conditionMapOptions);
      if (source === "object") return new MapResourceObject(conditionMapOptions);
      if (source === "redis") return new MapResourceRedis(conditionMapOptions);
      if (source === "testLocal") return new MapResourceLocal(conditionMapOptions);
      throw new Error("No valid source type specified: " + source);
    }
  }, {
    key: "get",
    value: function get() {
      if (this.fetchForEachRequest || !this.map) {
        this.map = this.source.fetch();
      }
      return this.map;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.map = null;
    }
  }]);
  return ConditionMap;
}();

var MapResource = function () {
  function MapResource(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResource);
    var applicationId = conditionMapOptions.applicationId,
        redis = conditionMapOptions.redis,
        sourceOptions = conditionMapOptions.sourceOptions;

    this.sourceOptions = sourceOptions;
    this.applicationId = applicationId;
    this.redis = redis;
  }

  /**
   * RedisからConditionMapの内容を取得する
   *
   * @returns conditionMapの内容
   * @throws Error RedisからconditionMapの取得に失敗したとき例外 `Error` を送出する。
   */


  (0, _createClass3.default)(MapResource, [{
    key: "fetch",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _this = this;

        var redisPool, result;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context.next = 3;
                return redisPool.getAsync("ConditionMap/" + this.applicationId).then(function (res) {
                  return JSON.parse(res);
                }).catch(function () {
                  throw new Error("Unable to retrieve a condition map from redis for application " + _this.applicationId);
                });

              case 3:
                result = _context.sent;
                return _context.abrupt("return", result);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetch() {
        return _ref.apply(this, arguments);
      }

      return fetch;
    }()

    /**
     * Redis に ConditionMap を JSON で保存する
     *
     * Redisに保存されるKeyは `ConditionMap/` が Prefix の `applicationId`.
     * `applicationId` は Constructor に渡されたものを使う。
     *
     * @param mapJson JSON形式のConditionMap。文字列
     * @returns {Promise<T>}
     * @private
     */

  }, {
    key: "_store",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(mapJson) {
        var redisPool;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context2.next = 3;
                return redisPool.setAsync("ConditionMap/" + this.applicationId, mapJson).then(function (res) {
                  return res;
                }).catch(function (e) {
                  throw e;
                });

              case 3:
                return _context2.abrupt("return", _context2.sent);

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _store(_x) {
        return _ref2.apply(this, arguments);
      }

      return _store;
    }()
  }]);
  return MapResource;
}();

var MapResourceJson = function (_MapResource) {
  (0, _inherits3.default)(MapResourceJson, _MapResource);

  function MapResourceJson(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceJson);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (MapResourceJson.__proto__ || Object.getPrototypeOf(MapResourceJson)).call(this, conditionMapOptions));

    var map = _this2.sourceOptions.map;

    _this2._store(map);
    return _this2;
  }

  return MapResourceJson;
}(MapResource);

var MapResourceObject = function (_MapResource2) {
  (0, _inherits3.default)(MapResourceObject, _MapResource2);

  function MapResourceObject(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceObject);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (MapResourceObject.__proto__ || Object.getPrototypeOf(MapResourceObject)).call(this, conditionMapOptions));

    var map = _this3.sourceOptions.map;

    _this3._store(JSON.stringify(map));
    return _this3;
  }

  return MapResourceObject;
}(MapResource);

var MapResourceLocal = function (_MapResource3) {
  (0, _inherits3.default)(MapResourceLocal, _MapResource3);

  function MapResourceLocal(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceLocal);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (MapResourceLocal.__proto__ || Object.getPrototypeOf(MapResourceLocal)).call(this, conditionMapOptions));

    _this4._store(JSON.stringify(TEST_MAP));
    return _this4;
  }

  return MapResourceLocal;
}(MapResource);

var MapResourceRedis = function (_MapResource4) {
  (0, _inherits3.default)(MapResourceRedis, _MapResource4);

  function MapResourceRedis(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceRedis);

    // 特別なことはしない = これをデフォルトとしたため
    return (0, _possibleConstructorReturn3.default)(this, (MapResourceRedis.__proto__ || Object.getPrototypeOf(MapResourceRedis)).call(this, conditionMapOptions));
  }

  return MapResourceRedis;
}(MapResource);

/*eslint-disable */


var TEST_MAP = [{ topic: 'profile',
  target: 'player',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'player_profile' }, { topic: 'profile',
  target: 'player',
  gender: '-',
  event: '-',
  period: '-',
  actionId: '絶対にこないはず なぜなら一つ上と条件が同じだから' }, { topic: 'profile',
  target: 'country',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'country_profile' }, { topic: 'profile',
  target: 'serina',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'serina_profile' }, { topic: 'profile',
  target: '-',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'unknown_profile' }, { topic: 'default_value',
  target: '-',
  gender: '[female]',
  event: '[all]',
  period: '[current]',
  actionId: 'default_value_all' }, { topic: 'default_value_case2',
  target: 'player',
  gender: '*',
  event: '*',
  period: '[do_not_write]',
  actionId: 'default_case2_1' }, { topic: 'default_value_case2',
  target: 'player',
  gender: '*',
  event: '[do_not_write]',
  period: '*',
  actionId: 'default_case2_2' }, { topic: 'default_value_case2',
  target: 'player',
  gender: '[do_not_write]',
  event: '*',
  period: '*',
  actionId: 'default_case2_3' }, { topic: 'default_value_case2',
  target: 'country',
  gender: '[female]',
  event: '[200m]',
  period: 'current',
  actionId: 'default_case2_4' }, { topic: 'default_value_case2',
  target: 'player',
  gender: '*',
  event: '*',
  period: '*',
  actionId: 'default_case2_5' }, { topic: 'default_value_case2',
  target: 'player',
  gender: '[male]',
  event: '[110m]',
  period: '[last]',
  actionId: 'default_case2_6' }, { topic: 'toilet',
  target: '-',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'toilet' }, { topic: '-',
  target: 'player',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'about_player' }, { topic: '-',
  target: 'country',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'about_country' }, { topic: '-',
  target: 'serina',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'about_serina' }, { topic: '-',
  target: '-',
  gender: '*',
  event: '-',
  period: '-',
  actionId: 'about_gender' }, { topic: '-',
  target: '-',
  gender: '-',
  event: '*',
  period: '-',
  actionId: 'about_event' }, { topic: '-',
  target: '-',
  gender: '-',
  event: '-',
  period: '*',
  actionId: 'about_period' }];
/*eslint-enable */