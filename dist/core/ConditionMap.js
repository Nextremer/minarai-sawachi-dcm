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
  function ConditionMap() {
    (0, _classCallCheck3.default)(this, ConditionMap);
    this.map = null;
  }

  (0, _createClass3.default)(ConditionMap, [{
    key: "_init",


    //TODO: BluebirdのRedisでキーの存在チェックできる？

    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(applicationId, conditionMapOptions, redisConfig) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(applicationId === undefined || applicationId === null || applicationId === "")) {
                  _context.next = 2;
                  break;
                }

                throw new Error("applicationId is invalid: " + applicationId);

              case 2:

                conditionMapOptions.applicationId = applicationId;
                conditionMapOptions.redis = redisConfig;

                _context.next = 6;
                return this._sourceSelector(conditionMapOptions);

              case 6:
                this.source = _context.sent;

                this.fetchForEachRequest = conditionMapOptions.fetchForEachRequest;

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _init(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return _init;
    }()
  }, {
    key: "_sourceSelector",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(conditionMapOptions) {
        var source;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                source = conditionMapOptions.source;

                if (!(source === "json")) {
                  _context2.next = 5;
                  break;
                }

                _context2.next = 4;
                return MapResource.initializeWithJSON(conditionMapOptions);

              case 4:
                return _context2.abrupt("return", _context2.sent);

              case 5:
                if (!(source === "object")) {
                  _context2.next = 9;
                  break;
                }

                _context2.next = 8;
                return MapResource.initializeWithObject(conditionMapOptions);

              case 8:
                return _context2.abrupt("return", _context2.sent);

              case 9:
                if (!(source === "redis")) {
                  _context2.next = 13;
                  break;
                }

                _context2.next = 12;
                return MapResource.initializeWithRedis(conditionMapOptions);

              case 12:
                return _context2.abrupt("return", _context2.sent);

              case 13:
                if (!(source === "testLocal")) {
                  _context2.next = 15;
                  break;
                }

                return _context2.abrupt("return", new MapResourceLocal(conditionMapOptions));

              case 15:
                throw new Error("No valid source type specified: " + source);

              case 16:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _sourceSelector(_x4) {
        return _ref2.apply(this, arguments);
      }

      return _sourceSelector;
    }()
  }, {
    key: "fetch",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var map;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(this.fetchForEachRequest || !this.map)) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 3;
                return this.source.fetch();

              case 3:
                map = _context3.sent;

                this.map = map;

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function fetch() {
        return _ref3.apply(this, arguments);
      }

      return fetch;
    }()
  }, {
    key: "get",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getMap();

              case 2:
                return _context4.abrupt("return", _context4.sent);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function get() {
        return _ref4.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "getMap",
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.fetch();

              case 2:
                return _context5.abrupt("return", this.map.conditionMap);

              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function getMap() {
        return _ref5.apply(this, arguments);
      }

      return getMap;
    }()
  }, {
    key: "getExtraSlotKeys",
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.fetch();

              case 2:
                return _context6.abrupt("return", this.map.extraSlotKeys);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getExtraSlotKeys() {
        return _ref6.apply(this, arguments);
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
  }], [{
    key: "getInstance",
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(applicationId, conditionMapOptions, redisConfig) {
        var cm;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                cm = new ConditionMap();
                _context7.next = 3;
                return cm._init(applicationId, conditionMapOptions, redisConfig);

              case 3:
                return _context7.abrupt("return", cm);

              case 4:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getInstance(_x5, _x6, _x7) {
        return _ref7.apply(this, arguments);
      }

      return getInstance;
    }()
  }]);
  return ConditionMap;
}();

var MapResource = function () {
  (0, _createClass3.default)(MapResource, null, [{
    key: "initializeWithJSON",
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(conditionMapOptions) {
        var res;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                res = new MapResourceJson(conditionMapOptions);
                _context8.next = 3;
                return res.init();

              case 3:
                return _context8.abrupt("return", res);

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function initializeWithJSON(_x8) {
        return _ref8.apply(this, arguments);
      }

      return initializeWithJSON;
    }()
  }, {
    key: "initializeWithObject",
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(conditionMapOptions) {
        var res;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                res = new MapResourceObject(conditionMapOptions);
                _context9.next = 3;
                return res.init();

              case 3:
                return _context9.abrupt("return", res);

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function initializeWithObject(_x9) {
        return _ref9.apply(this, arguments);
      }

      return initializeWithObject;
    }()
  }, {
    key: "initializeWithRedis",
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(conditionMapOptions) {
        var res;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                res = new MapResourceRedis(conditionMapOptions);
                _context10.next = 3;
                return res.init();

              case 3:
                return _context10.abrupt("return", res);

              case 4:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function initializeWithRedis(_x10) {
        return _ref10.apply(this, arguments);
      }

      return initializeWithRedis;
    }()
  }]);

  function MapResource(conditionMapOptions) {
    var _this = this;

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

    this._init = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, _this);
    }));
  }

  (0, _createClass3.default)(MapResource, [{
    key: "init",
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return this._init();

              case 2:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function init() {
        return _ref12.apply(this, arguments);
      }

      return init;
    }()

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

  }, {
    key: "fetch",
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13() {
        var _this2 = this;

        var redisPool, map;
        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context13.next = 3;
                return redisPool.getAsync("ConditionMap/" + this.applicationId).then(function (res) {
                  return JSON.parse(res);
                }).catch(function () {
                  throw new Error("Unable to retrieve a condition map from redis for application " + _this2.applicationId);
                });

              case 3:
                map = _context13.sent;

                if (!Array.isArray(map)) {
                  _context13.next = 8;
                  break;
                }

                // 取得したものが配列なら extraSlotKeys 情報が付加されていない ConditionMap とみなす
                map = { conditionMap: map, extraSlotKeys: [] };
                //TODO: map の内容から extraSlotKeysを推論させる？
                _context13.next = 16;
                break;

              case 8:
                if (!(map instanceof Object && map.hasOwnProperty("topic"))) {
                  _context13.next = 12;
                  break;
                }

                // 取得したものがオブジェクトだったら ConditionMap の単体が入っている可能性もある
                // topic keyがあるかどうかで判定
                map = { conditionMap: [map], extraSlotKeys: [] };
                _context13.next = 16;
                break;

              case 12:
                if (!(map instanceof Object && map.hasOwnProperty("conditionMap"))) {
                  _context13.next = 15;
                  break;
                }

                _context13.next = 16;
                break;

              case 15:
                throw new Error("Stored Condition Map for " + this.applicationId + " has invalid form.");

              case 16:

                // extraSlotKeys が初期値として与えられていたなら、それで上書きをする
                if (this.extraSlotKeys) {
                  map.extraSlotKeys = this.extraSlotKeys;
                }
                this.map = map;

                // Redis の有効期限を延長しておく
                _context13.next = 20;
                return this.updateRedisTtl();

              case 20:
                return _context13.abrupt("return", map);

              case 21:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function fetch() {
        return _ref13.apply(this, arguments);
      }

      return fetch;
    }()
  }, {
    key: "exists",
    value: function () {
      var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
        var _this3 = this;

        var redisPool, result;
        return _regenerator2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context14.next = 3;
                return redisPool.ttlAsync("ConditionMap/" + this.applicationId).then(function (res) {
                  // TTL が -2 はキーがないとき。 -1 は無期限。0以上は有効期限(秒)
                  // したがって、キーがあって、正常な期限があること
                  return res !== -2 && res >= -1;
                }).catch(function () {
                  throw new Error("Unable to retrieve a condition map key from redis for application " + _this3.applicationId);
                });

              case 3:
                result = _context14.sent;
                return _context14.abrupt("return", result);

              case 5:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function exists() {
        return _ref14.apply(this, arguments);
      }

      return exists;
    }()

    /**
     * ConditionMap の TTL を設定する
     * @param ttl TTL (秒) デフォルトは 30 日
     * @returns {Promise<boolean>}
     */

  }, {
    key: "updateRedisTtl",
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
        var ttl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : MONTH;
        var redisPool, resultExpiration;
        return _regenerator2.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                redisPool = _redisPool2.default.getPool(this.redis);
                _context15.next = 3;
                return redisPool.expireAsync("ConditionMap/" + this.applicationId, ttl > 0 ? ttl : MONTH).then(function (res) {
                  return res;
                }).catch(function (e) {
                  throw e;
                });

              case 3:
                resultExpiration = _context15.sent;
                return _context15.abrupt("return", resultExpiration === 1);

              case 5:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function updateRedisTtl() {
        return _ref15.apply(this, arguments);
      }

      return updateRedisTtl;
    }()

    /**
     * Redis に ConditionMap を JSON で保存する
     *
     * Redisに保存されるKeyは `ConditionMap/` が Prefix の `applicationId`.
     * `applicationId` は Constructor に渡されたものを使う。
     *
     * @param mapJson JSON形式のConditionMap。文字列
     * @param ttl
     * @returns {Promise<{result: {store: boolean, expiration: boolean}}>} データの保存と有効期限のセットの成否がbooleanで表現される
     */

  }, {
    key: "store",
    value: function () {
      var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(mapJson) {
        var ttl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MONTH;
        var redisPool, resultSet, resultExpiration;
        return _regenerator2.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return _redisPool2.default.getPool(this.redis);

              case 2:
                redisPool = _context16.sent;
                _context16.next = 5;
                return redisPool.setAsync("ConditionMap/" + this.applicationId, mapJson).then(function (res) {
                  return res;
                }).catch(function (e) {
                  throw e;
                });

              case 5:
                resultSet = _context16.sent;
                _context16.next = 8;
                return redisPool.expireAsync("ConditionMap/" + this.applicationId, ttl > 0 ? ttl : MONTH).then(function (res) {
                  return res;
                }).catch(function (e) {
                  throw e;
                });

              case 8:
                resultExpiration = _context16.sent;
                return _context16.abrupt("return", {
                  result: { store: resultSet === "OK", expiration: resultExpiration === 1 }
                });

              case 10:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function store(_x12) {
        return _ref16.apply(this, arguments);
      }

      return store;
    }()
  }]);
  return MapResource;
}();

var MapResourceJson = function (_MapResource) {
  (0, _inherits3.default)(MapResourceJson, _MapResource);

  function MapResourceJson(conditionMapOptions) {
    var _this5 = this;

    (0, _classCallCheck3.default)(this, MapResourceJson);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (MapResourceJson.__proto__ || Object.getPrototypeOf(MapResourceJson)).call(this, conditionMapOptions));

    var map = _this4.sourceOptions.map;

    var extraSlotKeys = _this4.extraSlotKeys ? _this4.extraSlotKeys : [];

    _this4._init = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17() {
      return _regenerator2.default.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return _this4.store(JSON.stringify({
                conditionMap: JSON.parse(map),
                extraSlotKeys: extraSlotKeys
              }));

            case 2:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17, _this5);
    }));
    return _this4;
  }

  return MapResourceJson;
}(MapResource);

var MapResourceObject = function (_MapResource2) {
  (0, _inherits3.default)(MapResourceObject, _MapResource2);

  function MapResourceObject(conditionMapOptions) {
    var _this7 = this;

    (0, _classCallCheck3.default)(this, MapResourceObject);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (MapResourceObject.__proto__ || Object.getPrototypeOf(MapResourceObject)).call(this, conditionMapOptions));

    var map = _this6.sourceOptions.map;

    var extraSlotKeys = _this6.extraSlotKeys ? _this6.extraSlotKeys : [];

    _this6._init = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18() {
      return _regenerator2.default.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return _this6.store(JSON.stringify({
                conditionMap: map,
                extraSlotKeys: extraSlotKeys
              }));

            case 2:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18, _this7);
    }));
    return _this6;
  }

  return MapResourceObject;
}(MapResource);

var MapResourceLocal = function (_MapResource3) {
  (0, _inherits3.default)(MapResourceLocal, _MapResource3);

  function MapResourceLocal(conditionMapOptions) {
    var _this9 = this;

    (0, _classCallCheck3.default)(this, MapResourceLocal);

    var _this8 = (0, _possibleConstructorReturn3.default)(this, (MapResourceLocal.__proto__ || Object.getPrototypeOf(MapResourceLocal)).call(this, conditionMapOptions));

    var extraSlotKeys = _this8.extraSlotKeys ? _this8.extraSlotKeys : [];

    _this8._init = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19() {
      return _regenerator2.default.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return _this8.store(JSON.stringify({
                conditionMap: TEST_MAP,
                extraSlotKeys: extraSlotKeys
              }));

            case 2:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee19, _this9);
    }));
    return _this8;
  }

  return MapResourceLocal;
}(MapResource);

var MapResourceRedis = function (_MapResource4) {
  (0, _inherits3.default)(MapResourceRedis, _MapResource4);

  function MapResourceRedis(conditionMapOptions) {
    var _this11 = this;

    (0, _classCallCheck3.default)(this, MapResourceRedis);

    var _this10 = (0, _possibleConstructorReturn3.default)(this, (MapResourceRedis.__proto__ || Object.getPrototypeOf(MapResourceRedis)).call(this, conditionMapOptions));

    _this10._init = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20() {
      return _regenerator2.default.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              if (!_this10.extraSlotKeys) {
                _context20.next = 3;
                break;
              }

              _context20.next = 3;
              return _this10._syncMap();

            case 3:
            case "end":
              return _context20.stop();
          }
        }
      }, _callee20, _this11);
    }));
    return _this10;
  }

  (0, _createClass3.default)(MapResourceRedis, [{
    key: "_syncMap",
    value: function () {
      var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21() {
        return _regenerator2.default.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.next = 2;
                return this.fetch();

              case 2:
                this.map.extraSlotKeys = this.extraSlotKeys;
                _context21.next = 5;
                return this.store(JSON.stringify(this.map));

              case 5:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      function _syncMap() {
        return _ref21.apply(this, arguments);
      }

      return _syncMap;
    }()
  }]);
  return MapResourceRedis;
}(MapResource);

var HOUR = 3600;
var DAY = HOUR * 24;
var MONTH = DAY * 30;

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