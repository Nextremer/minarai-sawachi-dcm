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

var _redisPool = require("../utils/redisPool");

var _redisPool2 = _interopRequireDefault(_redisPool);

var _Conditions = require("./Conditions");

var _Conditions2 = _interopRequireDefault(_Conditions);

var _Context = require("./Context");

var _Context2 = _interopRequireDefault(_Context);

var _ConditionMap = require("./ConditionMap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DialogueContextManager = function () {
  function DialogueContextManager() {
    (0, _classCallCheck3.default)(this, DialogueContextManager);
  }

  (0, _createClass3.default)(DialogueContextManager, [{
    key: "init",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(options) {
        var applicationId, conditionMap, redis, extraSlotKeys, initialLifeSpan, holdUsedSlot, verbose, condMap;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                applicationId = options.applicationId, conditionMap = options.conditionMap, redis = options.redis, extraSlotKeys = options.extraSlotKeys, initialLifeSpan = options.initialLifeSpan, holdUsedSlot = options.holdUsedSlot, verbose = options.verbose;

                if (applicationId) {
                  _context.next = 3;
                  break;
                }

                throw Error("DialogueContextManager#constructor: Valid applicationId required.");

              case 3:
                this.applicationId = applicationId;

                // 渡されてくるconditionMapが Falsy な値なら、
                // Redisに保存されているConditionMapを使用する
                // Truthy な値なら、その内容に基づいてConditionMapをつくる
                condMap = null;

                if (!conditionMap) {
                  // it depends on valid applicationId and redisPool
                  condMap = DialogueContextManager._generateSourceOptionsForRedis(applicationId);
                } else {
                  condMap = conditionMap;
                }
                // ConditionMapにextraSlotKeysを渡す
                condMap.extraSlotKeys = extraSlotKeys;

                _context.next = 9;
                return _ConditionMap.ConditionMap.getInstance(this.applicationId, condMap, redis);

              case 9:
                this.ruleMap = _context.sent;


                this.redis = redis;

                this.extraSlotKeys = extraSlotKeys;
                this.holdUsedSlot = holdUsedSlot;
                this.initialLifeSpan = initialLifeSpan;
                this.verbose = verbose;

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "vLog",
    value: function vLog(text) {
      if (!this.verbose) {
        return;
      }
      console.log(text);
    }
  }, {
    key: "getNewContext",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(userId, newInput) {
        var errors, context, ruleMap, matchedCondition;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.vLog("DialogueContextManager#getNewContext called");
                _context2.prev = 1;

                // DCM treats null topic.id as '-' (no intent)
                if (newInput.body.topic && newInput.body.topic.id === null) {
                  newInput.body.topic.id = "-";
                }

                errors = this.validateInput((newInput || {}).body);

                if (!(errors.length > 0)) {
                  _context2.next = 7;
                  break;
                }

                console.error(errors.join("\n"));
                throw new Error("DialogueContextManager#getNewContext invalid input");

              case 7:
                this.vLog("input validation done");

                // contextをredisから取得
                _context2.next = 10;
                return _Context2.default.getOrInitial(
                // this.applicationId,
                userId, _redisPool2.default.getPool(this.redis), {
                  initialLifeSpan: this.initialLifeSpan,
                  extraSlotKeys: this.extraSlotKeys,
                  holdUsedSlot: this.holdUsedSlot
                });

              case 10:
                context = _context2.sent;

                this.vLog("get context done");

                // contextをupdateする
                _context2.next = 14;
                return context.update(newInput);

              case 14:
                context.forget();
                this.vLog("update context done");

                // contextからconditionゲット
                _context2.next = 18;
                return this.ruleMap.get();

              case 18:
                ruleMap = _context2.sent;
                matchedCondition = new _Conditions2.default(ruleMap, this.extraSlotKeys, context).getMatchedCondition();

                context.setMatchedCondition(matchedCondition);
                this.vLog("pickup condition done");

                // contextを永続化
                _context2.next = 24;
                return context.persist();

              case 24:
                this.vLog("persist context done");

                // contextを返却
                return _context2.abrupt("return", context);

              case 28:
                _context2.prev = 28;
                _context2.t0 = _context2["catch"](1);

                console.error("Error on DialogueContextManager#getNewContext");
                console.error(_context2.t0);
                throw new Error(_context2.t0);

              case 33:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 28]]);
      }));

      function getNewContext(_x2, _x3) {
        return _ref2.apply(this, arguments);
      }

      return getNewContext;
    }()
  }, {
    key: "resetMap",
    value: function resetMap() {
      this.ruleMap.clear();
    }
  }, {
    key: "validateInput",
    value: function validateInput(inputBody) {
      var _this = this;

      var errors = [];
      if (!inputBody) {
        return ["input.body must be an Object"];
      }
      Object.keys(inputBody).forEach(function (key) {
        if (_this.extraSlotKeys.includes(key) && !isDefinedText(inputBody[key].keyword)) {
          errors.push(" input value \"" + key + "\" is expected to have property \"keyword\", but actual is \"" + JSON.stringify(inputBody[key]) + "\"");
        }
        if (key === "topic" && !isDefinedText(inputBody[key].id)) {
          errors.push(" input value \"topic\" is expected to have property \"id\", but actual is \"" + JSON.stringify(inputBody[key]) + "\"");
        }
        if (key === "target" && (!isDefinedText(inputBody[key].type) || !isDefinedText(inputBody[key].keyword))) {
          errors.push(" input value \"target\" is expected to have property \"type\" and \"keyword\", but actual is \"" + JSON.stringify(inputBody[key]) + "\"");
        }
      });
      return errors;
    }
  }], [{
    key: "getInstance",

    /**
     * DialogueContextManagerのインスタンスを取得する
     *
     * @param options
     */
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(options /* see constructor */) {
        var dcm;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                dcm = new DialogueContextManager();
                _context3.next = 3;
                return dcm.init(options);

              case 3:
                return _context3.abrupt("return", dcm);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getInstance(_x4) {
        return _ref3.apply(this, arguments);
      }

      return getInstance;
    }()
  }, {
    key: "conditionMapExists",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(applicationId, redisConfig) {
        var cm;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _ConditionMap.ConditionMap.getInstance(applicationId, DialogueContextManager._generateSourceOptionsForRedis(applicationId), redisConfig);

              case 2:
                cm = _context4.sent;
                return _context4.abrupt("return", cm.mapExists());

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function conditionMapExists(_x5, _x6) {
        return _ref4.apply(this, arguments);
      }

      return conditionMapExists;
    }()
  }, {
    key: "_generateSourceOptionsForRedis",
    value: function _generateSourceOptionsForRedis(applicationId) {
      return {
        source: "redis",
        sourceOptions: {
          applicationId: applicationId
        }
      };
    }
  }]);
  return DialogueContextManager;
}();

exports.default = DialogueContextManager;


function isDefinedText(text) {
  if (text) {
    return true;
  }
  if (text === "") {
    return true;
  }
  return false;
}