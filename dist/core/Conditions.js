"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_RESPONSE_ACTION_ID = exports.WILD_CARD = undefined;

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

exports.conditionUses = conditionUses;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IGNORE_OPERATOR = "-";
var EQUAL_OPERATOR = "=";
var UNFILLED_OPERATOR = "?";
var WILD_CARD = exports.WILD_CARD = "*";
var DEFAULT_RESPONSE_ACTION_ID = exports.DEFAULT_RESPONSE_ACTION_ID = "default_response";

var Conditions = function () {
  function Conditions(map, extraSlotKeys, context) {
    (0, _classCallCheck3.default)(this, Conditions);
    this.map = [];
    this.context = {};

    this.map = map;
    this.extraSlotKeys = extraSlotKeys;
    this.context = context;
  }

  (0, _createClass3.default)(Conditions, [{
    key: "getMatchedCondition",
    value: function getMatchedCondition() {
      var _this = this;

      if (!this.context.latestInput.isAvailable) {
        return { actionId: DEFAULT_RESPONSE_ACTION_ID };
      }
      // 共通する話題に触れているなら topic id を取得
      var topicId = this.getTopicIdToTake();

      // 共通する話題に触れていないなら、覚えていた topic id を忘れる
      if (isIgnoreOperator(topicId)) {
        this.context.body.resetTopic();
      }
      // その上で、関連しそうな conditions をすべて取得する
      var conditions = this.getConditionsByTopicId(topicId);

      // topicにマッチしたconditionをふるいにかける
      var candidates = conditions.filter(function (condition) {
        // target が一致？
        var targetMatched = _this.targetMatcher(true, condition, _this.context);
        // その他の項目もマッチする？
        var extraKeysMatchedArray = _this.extraSlotKeys.map(function (key) {
          return _this.additionalInfoMatcher(true, condition, key, _this.context);
        });
        // 全部の項目にマッチした condition を生き残らせる
        var allMatched = ![targetMatched].concat((0, _toConsumableArray3.default)(extraKeysMatchedArray)).includes(false);
        return allMatched;
      });

      // 生き残った condition について、
      var scores = candidates.map(function (condition) {
        // エンジンからの入力の `target` がこれまでの会話から変化しているかどうかを調べる
        var targetMatched = _this.targetMatcher(false, condition, _this.context.latestInput);
        var extraKeysMatchedArray = _this.extraSlotKeys.map(function (key) {
          return _this.additionalInfoMatcher(false, condition, key, _this.context.latestInput);
        });

        // マッチした数を数えてそれをスコアとする
        var s = {
          score: countTrueValue([targetMatched].concat((0, _toConsumableArray3.default)(extraKeysMatchedArray)))
        };
        return (0, _extends3.default)({}, condition, s);
      });

      // 最高のスコアの condition のうち、一番最初のものを Matched Condition とする
      var maxScore = Math.max.apply(Math, (0, _toConsumableArray3.default)(scores.map(function (s) {
        return s.score;
      })));
      return scores.filter(function (s) {
        return s.score === maxScore;
      })[0] || {
        actionId: DEFAULT_RESPONSE_ACTION_ID
      };
    }

    /**
     * 前回から引き継いだcontextのtopicに関連するconditionの群から、
     * 指定された `key` に対応する値が IgnoreOperator ではない最初の condition を取り出す
     *
     * `key` に基づいて condition定義を取り出す。
     *
     * @param key
     * @returns {*|number|T} 見つからないときは `undefined`
     */

  }, {
    key: "contextTopicRequires",
    value: function contextTopicRequires(key) {
      var _this2 = this;

      // 引き継いだcontextのtopicに対応するconditionを準備する
      var topicId = (this.context.body.topic || { id: IGNORE_OPERATOR }).id;
      var conditions = this.getConditionsByTopicId(topicId);

      // topicに関連するcondition定義の群から、
      // 指定された `key` に対応する値が IgnoreOperator ではない最初の condition を取り出す
      return conditions.find(function (c) {
        if (key === "target") {
          return c.target === (_this2.context.body.target || {}).type;
        } else {
          return !isIgnoreOperator(c[key]);
        }
      });
    }
  }, {
    key: "getConditionsByTopicId",
    value: function getConditionsByTopicId(topicId) {
      return this.map.filter(function (row) {
        return row.topic === topicId;
      });
    }

    /**
     * 引数に指定された `context` の `target` が指定された `condition` の `target` に一致するかどうかを試験する
     *
     * @param allowIgnore Ignore演算子を "Match" とみなすかどうか
     * @param condition
     * @param context
     * @returns {boolean} `context` が `condition` に "Match" すれば `true`
     */

  }, {
    key: "targetMatcher",
    value: function targetMatcher(allowIgnore, condition, context) {
      if (isIgnoreOperator(condition.target)) {
        return !!allowIgnore;
      }
      if (!condition.target) {
        return true;
      }
      if (!context.body.target) {
        return false;
      }

      return context.body.target.type === condition.target;
    }

    /**
     * 追加のSlotKeyについて
     * @param allowIgnoreAndDefault
     * @param condition
     * @param bodyKey
     * @param context
     * @returns {boolean}
     */

  }, {
    key: "additionalInfoMatcher",
    value: function additionalInfoMatcher(allowIgnoreAndDefault, condition, bodyKey, context) {
      if (!condition[bodyKey]) {
        var error = "SlotKey \"" + bodyKey + "\" does not exist on ConditionMap. Check if you specify extraSlotKeys option properly.";
        throw new Error(error);
      }

      var matchedAsDefaultValue = condition[bodyKey].match(/\[.*?\]/);

      if (isIgnoreOperator(condition[bodyKey]) || matchedAsDefaultValue) {
        return !!allowIgnoreAndDefault;
      }

      var candidateValues = condition[bodyKey].split(",");

      var bodyHasKey = bodyKey in context.body;
      // candidateValues に `undefined` がない前提
      var keyword = (context.body[bodyKey] || {}).keyword;

      var conditionIsWildCard = condition[bodyKey] === WILD_CARD;
      var conditionIsUnfilledSlot = condition[bodyKey] === UNFILLED_OPERATOR;
      var contextIsUnfilledSlot = bodyHasKey && keyword === UNFILLED_OPERATOR;

      // WildCard `*` は context.body[bodyKey] があり
      // かつ空文字や"-"でないときにマッチする
      // TODO: 整理する
      var matchedWildCard = conditionIsWildCard && bodyHasKey && context.body[bodyKey].keyword !== "" && context.body[bodyKey].keyword !== "-";
      // Unfilled `?` は
      // 1) 入力が空きだったときにマッチする
      // 2) もしくは入力が `?` で条件がなにかあるときにマッチする
      var matchedUnfilled = conditionIsUnfilledSlot && !bodyHasKey || contextIsUnfilledSlot && condition[bodyKey] !== null && condition[bodyKey] !== "";

      return matchedWildCard || matchedUnfilled || candidateValues.includes(keyword);
    }
  }, {
    key: "getTopicIdToTake",
    value: function getTopicIdToTake() {
      var _this3 = this;

      // エンジンからの入力の `topic` を取り出す
      var consensusTopic = this.context.latestInput.body.topic;

      // エンジンからの入力のTopicに `id` があればそれを返す
      if (consensusTopic && consensusTopic.id) {
        return consensusTopic.id;
      }

      // エンジンからの入力に `topic` がない場合には
      var keys = ["target"].concat((0, _toConsumableArray3.default)(this.extraSlotKeys));

      // それぞれの `key` について、
      // エンジンからの入力に対応する値がある && 引き継いだcontextに対応する値がある
      // →何か共通して触れているものがあるかどうかを調べる
      var contextTopicUsesConsensusValue = keys.map(function (key) {
        var value = _this3.context.latestInput.body[key];
        return !!(value && _this3.contextTopicRequires(key));
      }).includes(true);

      // 全く関連性がない場合には IGNORE_OPERATOR を引き続き topic id とし、
      if (!contextTopicUsesConsensusValue) {
        return IGNORE_OPERATOR;
      }

      // 前回から引き継いだ context の topic id があればそれを今回の topic id とする
      return (this.context.body.topic || { id: IGNORE_OPERATOR }).id;
    }
  }]);
  return Conditions;
}();

/**
 * 条件が使われているか判定する
 *
 * @param condition
 * @param key
 * @returns {boolean} 条件が使われていれば true, 条件として「除外」演算子が使われている場合と、条件が使われていない場合には `false`
 */


exports.default = Conditions;
function conditionUses(condition, key) {
  if (!condition || !condition[key]) {
    return false;
  }
  //return ![ IGNORE, WILD_CARD ].includes( condition[key] );
  return ![IGNORE_OPERATOR].includes(condition[key]);
}

function countTrueValue(array) {
  return array.filter(function (val) {
    return !!val;
  }).length;
}

function isIgnoreOperator(operator) {
  return [IGNORE_OPERATOR, EQUAL_OPERATOR].includes(operator);
}