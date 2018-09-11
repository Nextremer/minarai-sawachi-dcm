"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _ContextSlots = require("./ContextSlots");

var _ContextSlots2 = _interopRequireDefault(_ContextSlots);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Context = function () {
  //latestRequest = undefined;
  function Context(userId, redisPool, config) {
    (0, _classCallCheck3.default)(this, Context);
    this.userId = "";
    this.latestInput = undefined;
    this.matchedCondition = undefined;
    this.extra = {};
    var extraSlotKeys = config.extraSlotKeys,
        initialLifeSpan = config.initialLifeSpan,
        holdUsedSlot = config.holdUsedSlot;

    this.redisPool = redisPool;
    this.userId = userId;
    this.extraSlotKeys = extraSlotKeys;
    this.holdUsedSlot = holdUsedSlot;
    this.initialLifeSpan = initialLifeSpan;
    this.body = new _ContextSlots2.default({ extraSlotKeys: extraSlotKeys, initialLifeSpan: initialLifeSpan, holdUsedSlot: holdUsedSlot }, {});
  }

  (0, _createClass3.default)(Context, [{
    key: "createNewContextSlots",
    value: function createNewContextSlots(newInput) {
      return new _ContextSlots2.default({
        extraSlotKeys: this.extraSlotKeys,
        initialLifeSpan: this.initialLifeSpan
      }, newInput);
    }

    // TODO : 新しい機能として...
    //reBuild(){
    //  const newBody = new ContextSlots(  initialLifeSpan, {});
    //  this.body.merge( ContextSlots.fromEnginesConsensus( this ));
    //}

  }, {
    key: "serialize",
    value: function serialize() {
      var userId = this.userId,
          latestInput = this.latestInput,
          matchedCondition = this.matchedCondition,
          body = this.body,
          extra = this.extra;

      return JSON.stringify({
        userId: userId,
        latestInput: latestInput,
        matchedCondition: matchedCondition,
        body: body,
        extra: extra
      });
    }
  }, {
    key: "persist",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var ttl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : WEEK;
        var resultSet, resultExpiration;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.redisPool.setAsync(this.userId, this.serialize()).catch(function (e) {
                  console.error("contextの保存に失敗しました。", e);
                });

              case 2:
                resultSet = _context.sent;
                _context.next = 5;
                return this.redisPool.expireAsync(this.userId, ttl > 0 ? ttl : WEEK).catch(function (e) {
                  console.error("contextの有効期限の設定に失敗しました。", e);
                });

              case 5:
                resultExpiration = _context.sent;
                return _context.abrupt("return", {
                  result: { store: resultSet === "OK", expiration: resultExpiration === 1 }
                });

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function persist() {
        return _ref.apply(this, arguments);
      }

      return persist;
    }()
  }, {
    key: "get",
    value: function get(key) {
      return this.body[key];
    }
  }, {
    key: "setValue",
    value: function setValue(key, value) {
      this.body.setValue(key, value);
    }

    /**
     * 各要素のlifeSpanCounterをデクリメントして、
     * ゼロより小さくなった要素を消去する
     */

  }, {
    key: "forget",
    value: function forget() {
      this.body.forget();
      return this;
    }

    /**
     * Redisに保存されたContextを削除する
     * @returns {*|Promise<T>}
     */

  }, {
    key: "clear",
    value: function clear() {
      return this.redisPool.delAsync(this.userId).catch(function (e) {
        console.error("contextの削除に失敗しました。", e);
      });
    }

    /**
     * 対話エンジンの出力結果を手持ちの情報に合成する
     *
     * @param enginesConsensus
     * @returns {Promise<void>}
     */

  }, {
    key: "update",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(enginesConsensus) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.latestInput = enginesConsensus;
                this.body.merge(this.createNewContextSlots(enginesConsensus.body));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function update(_x2) {
        return _ref2.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: "setMatchedCondition",
    value: function setMatchedCondition(matchedCondition) {
      this.matchedCondition = matchedCondition;
      // conditionで使ったslotを保護 = LifeSpanを初期値に回復する
      if (this.holdUsedSlot) {
        this.body.protectUsedKeys(matchedCondition);
      }
      this.body.replaceByDefaultValue(matchedCondition);
    }

    //////////////////////////////
    // static Methods

    /**
     * Contextのオブジェクトを取得する
     *
     * Redisに保存されたContextオブジェクトがあればもとにして復元する。
     * 見つけられなければ、新しいContextを生成する。
     *
     * @param userId
     * @param redisPool
     * @param options
     * @returns {*}
     */

  }], [{
    key: "getOrInitial",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(userId, redisPool, options) {
        var extraSlotKeys, initialLifeSpan, holdUsedSlot;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                extraSlotKeys = options.extraSlotKeys, initialLifeSpan = options.initialLifeSpan, holdUsedSlot = options.holdUsedSlot;
                _context3.next = 3;
                return redisPool.getAsync(userId).then(function (r) {
                  if (!r) {
                    console.log("new context generated ");
                    return new Context(userId, redisPool, {
                      extraSlotKeys: extraSlotKeys,
                      initialLifeSpan: initialLifeSpan,
                      holdUsedSlot: holdUsedSlot
                    });
                  }

                  var context = new Context(userId, redisPool, {
                    extraSlotKeys: extraSlotKeys,
                    initialLifeSpan: initialLifeSpan,
                    holdUsedSlot: holdUsedSlot
                  });
                  var fromRedis = JSON.parse(r);
                  context.body.merge(fromRedis.body);
                  context.matchedCondition = fromRedis.matchedCondition;
                  if (fromRedis.latestInput) {
                    context.latestInput = fromRedis.latestInput;
                  }
                  if (fromRedis.extra) {
                    context.extra = fromRedis.extra;
                  }
                  return context;
                });

              case 3:
                return _context3.abrupt("return", _context3.sent);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getOrInitial(_x3, _x4, _x5) {
        return _ref3.apply(this, arguments);
      }

      return getOrInitial;
    }()
  }]);
  return Context;
}();

exports.default = Context;


var HOUR = 3600;
var DAY = HOUR * 24;
var WEEK = DAY * 7;