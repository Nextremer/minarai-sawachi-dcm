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
  (0, _createClass3.default)(DialogueContextManager, null, [{
    key: "getInstance",


    /**
     * [Deprecated] DialogueContextManagerのインスタンスを取得する
     *
     * new DialogueContextManager(options) を使用してください
     *
     * @deprecated
     * @param options
     */
    value: function getInstance(options /* see constructor */) {
      return new DialogueContextManager(options);
    }
  }, {
    key: "conditionMapExists",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(applicationId, redisConfig) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new _ConditionMap.ConditionMap(applicationId, DialogueContextManager._generateSourceOptionsForRedis(applicationId), redisConfig).mapExists();

              case 2:
                return _context.abrupt("return", _context.sent);

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function conditionMapExists(_x, _x2) {
        return _ref.apply(this, arguments);
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

  function DialogueContextManager(options) {
    (0, _classCallCheck3.default)(this, DialogueContextManager);
    var applicationId = options.applicationId,
        conditionMap = options.conditionMap,
        redis = options.redis,
        extraSlotKeys = options.extraSlotKeys,
        initialLifeSpan = options.initialLifeSpan,
        holdUsedSlot = options.holdUsedSlot,
        verbose = options.verbose;


    if (!applicationId) {
      throw Error("DialogueContextManager#constructor: Valid applicationId required.");
    }
    this.applicationId = applicationId;

    // 渡されてくるconditionMapが Falsy な値なら、
    // Redisに保存されているConditionMapを使用する
    // Truthy な値なら、その内容に基づいてConditionMapをつくる
    var condMap = null;
    if (!conditionMap) {
      // it depends on valid applicationId and redisPool
      condMap = DialogueContextManager._generateSourceOptionsForRedis(applicationId);
    } else {
      condMap = conditionMap;
    }

    this.ruleMap = new _ConditionMap.ConditionMap(this.applicationId, condMap, redis);

    this.redis = redis;

    this.extraSlotKeys = extraSlotKeys;
    this.holdUsedSlot = holdUsedSlot;
    this.initialLifeSpan = initialLifeSpan;
    this.verbose = verbose;
  }

  (0, _createClass3.default)(DialogueContextManager, [{
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
                errors = this.validateInput((newInput || {}).body);

                if (!(errors.length > 0)) {
                  _context2.next = 6;
                  break;
                }

                console.error(errors.join("\n"));
                throw new Error("DialogueContextManager#getNewContext invalid input");

              case 6:
                this.vLog("input validation done");

                // contextをredisから取得
                _context2.next = 9;
                return _Context2.default.getOrInitial(
                // this.applicationId,
                userId, _redisPool2.default.getPool(this.redis), {
                  initialLifeSpan: this.initialLifeSpan,
                  extraSlotKeys: this.extraSlotKeys,
                  holdUsedSlot: this.holdUsedSlot
                });

              case 9:
                context = _context2.sent;

                this.vLog("get context done");

                // contextをupdateする
                _context2.next = 13;
                return context.update(newInput);

              case 13:
                context.forget();
                this.vLog("update context done");

                // contextからconditionゲット
                _context2.next = 17;
                return this.ruleMap.get();

              case 17:
                ruleMap = _context2.sent;
                matchedCondition = new _Conditions2.default(ruleMap, this.extraSlotKeys, context).getMatchedCondition();

                context.setMatchedCondition(matchedCondition);
                this.vLog("pickup condition done");

                // contextを永続化
                _context2.next = 23;
                return context.persist();

              case 23:
                this.vLog("persist context done");

                // contextを返却
                return _context2.abrupt("return", context);

              case 27:
                _context2.prev = 27;
                _context2.t0 = _context2["catch"](1);

                console.error("Error on DialogueContextManager#getNewContext");
                console.error(_context2.t0);
                throw new Error(_context2.t0);

              case 32:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[1, 27]]);
      }));

      function getNewContext(_x3, _x4) {
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