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
    key: "fetch",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var map;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.fetchForEachRequest || !this.map)) {
                  _context.next = 5;
                  break;
                }

                _context.next = 3;
                return this.source.fetch();

              case 3:
                map = _context.sent;

                this.map = map;

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
  }, {
    key: "get",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getMap();

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function get() {
        return _ref2.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "getMap",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.fetch();

              case 2:
                return _context3.abrupt("return", this.map.conditionMap);

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getMap() {
        return _ref3.apply(this, arguments);
      }

      return getMap;
    }()
  }, {
    key: "getExtraSlotKeys",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.fetch();

              case 2:
                return _context4.abrupt("return", this.map.extraSlotKeys);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getExtraSlotKeys() {
        return _ref4.apply(this, arguments);
      }

      return getExtraSlotKeys;
    }()

    /**
     * ConditionMapがRedis上に存在するかどうか確認する。
     *
     * @returns {Promise<boolean>} あればTrue, なければFalse。
     */

  }, {
    key: "mapExists",
    value: function mapExists() {
      var r = this.source.exists();
      return r;
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
        sourceOptions = conditionMapOptions.sourceOptions,
        extraSlotKeys = conditionMapOptions.extraSlotKeys;

    this.sourceOptions = sourceOptions;
    this.applicationId = applicationId;
    this.redis = redis;
    this.map = null; // 取得した ConditionMap + ExtraSlotKeys

    if (!(extraSlotKeys === undefined && extraSlotKeys instanceof Array)) {
      this.extraSlotKeys = extraSlotKeys;
    }
  }

  /**
   * RedisからConditionMapの内容を取得する
   *
   * インスタンス生成時にextraSlotKeysが設定されていれば、
   * 取得したConditionMapに関連するextraSlotKeysを、
   * インスタンス生成時のもので上書きをする。
   *
   * @returns conditionMapの内容
   * @throws Error RedisからconditionMapの取得に失敗したとき例外 `Error` を送出する。
   */


  (0, _createClass3.default)(MapResource, [{
    key: "fetch",
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var _this = this;

        var redisPool, map;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context5.next = 3;
                return redisPool.getAsync("ConditionMap/" + this.applicationId).then(function (res) {
                  return JSON.parse(res);
                }).catch(function () {
                  throw new Error("Unable to retrieve a condition map from redis for application " + _this.applicationId);
                });

              case 3:
                map = _context5.sent;

                if (!(map instanceof Array)) {
                  _context5.next = 8;
                  break;
                }

                // 取得したものが配列なら extraSlotKeys 情報が付加されていない ConditionMap とみなす
                map = { conditionMap: map, extraSlotKeys: [] };
                //TODO: map の内容から extraSlotKeysを推論させる？
                _context5.next = 16;
                break;

              case 8:
                if (!(map instanceof Object && map.hasOwnProperty("topic"))) {
                  _context5.next = 12;
                  break;
                }

                // 取得したものがオブジェクトだったら ConditionMap の単体が入っている可能性もある
                // topic keyがあるかどうかで判定
                map = { conditionMap: [map], extraSlotKeys: [] };
                _context5.next = 16;
                break;

              case 12:
                if (!(map instanceof Object && map.hasOwnProperty("conditionMap"))) {
                  _context5.next = 15;
                  break;
                }

                _context5.next = 16;
                break;

              case 15:
                throw new Error("Stored Condition Map for " + this.applicationId + " has invalid form.");

              case 16:

                // extraSlotKeys が初期値として与えられていたなら、それで上書きをする
                if (this.extraSlotKeys) {
                  map.extraSlotKeys = this.extraSlotKeys;
                }
                this.map = map;

                return _context5.abrupt("return", map);

              case 19:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function fetch() {
        return _ref5.apply(this, arguments);
      }

      return fetch;
    }()
  }, {
    key: "exists",
    value: function exists() {
      var _this2 = this;

      var redisPool = _redisPool2.default.getPool(this.redis);
      var result = redisPool.ttlAsync("ConditionMap/" + this.applicationId).then(function (res) {
        // TTL が -2 はキーがないとき。 -1 は無期限。0以上は有効期限(秒)
        // したがって、キーがあって、正常な期限があること
        return res !== -2 && res >= -1;
      }).catch(function () {
        throw new Error("Unable to retrieve a condition map key from redis for application " + _this2.applicationId);
      });
      return result;
    }

    /**
     * Redis に ConditionMap を JSON で保存する
     *
     * Redisに保存されるKeyは `ConditionMap/` が Prefix の `applicationId`.
     * `applicationId` は Constructor に渡されたものを使う。
     *
     * @param mapJson JSON形式のConditionMap。文字列
     * @returns {Promise<T>}
     */

  }, {
    key: "store",
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(mapJson) {
        var redisPool;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context6.next = 3;
                return redisPool.setAsync("ConditionMap/" + this.applicationId, mapJson).then(function (res) {
                  return res;
                }).catch(function (e) {
                  throw e;
                });

              case 3:
                return _context6.abrupt("return", _context6.sent);

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function store(_x) {
        return _ref6.apply(this, arguments);
      }

      return store;
    }()
  }]);
  return MapResource;
}();

var MapResourceJson = function (_MapResource) {
  (0, _inherits3.default)(MapResourceJson, _MapResource);

  function MapResourceJson(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceJson);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (MapResourceJson.__proto__ || Object.getPrototypeOf(MapResourceJson)).call(this, conditionMapOptions));

    var map = _this3.sourceOptions.map;

    var extraSlotKeys = _this3.extraSlotKeys ? _this3.extraSlotKeys : [];

    _this3.store(JSON.stringify({
      conditionMap: JSON.parse(map),
      extraSlotKeys: extraSlotKeys
    }));
    return _this3;
  }

  return MapResourceJson;
}(MapResource);

var MapResourceObject = function (_MapResource2) {
  (0, _inherits3.default)(MapResourceObject, _MapResource2);

  function MapResourceObject(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceObject);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (MapResourceObject.__proto__ || Object.getPrototypeOf(MapResourceObject)).call(this, conditionMapOptions));

    var map = _this4.sourceOptions.map;

    var extraSlotKeys = _this4.extraSlotKeys ? _this4.extraSlotKeys : [];

    _this4.store(JSON.stringify({ conditionMap: map, extraSlotKeys: extraSlotKeys }));
    return _this4;
  }

  return MapResourceObject;
}(MapResource);

var MapResourceLocal = function (_MapResource3) {
  (0, _inherits3.default)(MapResourceLocal, _MapResource3);

  function MapResourceLocal(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceLocal);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (MapResourceLocal.__proto__ || Object.getPrototypeOf(MapResourceLocal)).call(this, conditionMapOptions));

    var extraSlotKeys = _this5.extraSlotKeys ? _this5.extraSlotKeys : [];

    _this5.store(JSON.stringify({ conditionMap: TEST_MAP, extraSlotKeys: extraSlotKeys }));
    return _this5;
  }

  return MapResourceLocal;
}(MapResource);

var MapResourceRedis = function (_MapResource4) {
  (0, _inherits3.default)(MapResourceRedis, _MapResource4);

  function MapResourceRedis(conditionMapOptions) {
    (0, _classCallCheck3.default)(this, MapResourceRedis);

    // extraSlotKeysが指定されていたら同期を取る
    var _this6 = (0, _possibleConstructorReturn3.default)(this, (MapResourceRedis.__proto__ || Object.getPrototypeOf(MapResourceRedis)).call(this, conditionMapOptions));

    if (_this6.extraSlotKeys) {
      _this6._syncMap();
    }
    return _this6;
  }

  (0, _createClass3.default)(MapResourceRedis, [{
    key: "_syncMap",
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.fetch();

              case 2:
                this.map.extraSlotKeys = this.extraSlotKeys;
                _context7.next = 5;
                return this.store(JSON.stringify(this.map));

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _syncMap() {
        return _ref7.apply(this, arguments);
      }

      return _syncMap;
    }()
  }]);
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