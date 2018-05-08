"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _Conditions = require("./Conditions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_INITIAL_LIFE_SPAN = 2;

var ContextSlots = function () {
  function ContextSlots(config, slots) {
    (0, _classCallCheck3.default)(this, ContextSlots);
    this.slotKeys = [];
    var extraSlotKeys = config.extraSlotKeys,
        initialLifeSpan = config.initialLifeSpan,
        holdUsedSlot = config.holdUsedSlot;

    this.initialLifeSpan = initialLifeSpan || DEFAULT_INITIAL_LIFE_SPAN;
    this.slotKeys = ["topic", "target"].concat((0, _toConsumableArray3.default)(extraSlotKeys));
    this.holdUsedSlot = holdUsedSlot;
    this._assignProperties(slots); // undefinedの場合はkeyすら存在させないようにする
  }

  (0, _createClass3.default)(ContextSlots, [{
    key: "protectUsedKeys",
    value: function protectUsedKeys(matchedCondition) {
      var _this = this;

      this.slotKeys.forEach(function (key) {
        if (!_this[key]) {
          return;
        }

        if ((0, _Conditions.conditionUses)(matchedCondition, key)) {
          _this[key].lifeSpanCounter = _this.initialLifeSpan;
        }
      });
    }
  }, {
    key: "resetTopic",
    value: function resetTopic() {
      delete this.topic;
    }
  }, {
    key: "forget",
    value: function forget() {
      var _this2 = this;

      this.slotKeys.forEach(function (key) {
        var item = _this2[key];
        if (!item) {
          return;
        }

        if (typeof item.lifeSpanCounter === "number") {
          item.lifeSpanCounter--;
        } else {
          item.lifeSpanCounter = _this2.initialLifeSpan;
        }
        if (item.lifeSpanCounter < 0) {
          delete _this2[key];
        }
      });
    }

    // undefinedの場合はkeyすら存在させないようにする

  }, {
    key: "_assignProperties",
    value: function _assignProperties(options) {
      var _this3 = this;

      this.slotKeys.forEach(function (key) {
        if (options[key]) {
          _this3[key] = options[key];
        }
      });
      this._addLifeSpanCounter();
    }
  }, {
    key: "_addLifeSpanCounter",
    value: function _addLifeSpanCounter() {
      var _this4 = this;

      return this.slotKeys.forEach(function (key) {
        if (_this4[key] && _this4[key].lifeSpanCounter === undefined) {
          _this4[key].lifeSpanCounter = _this4.initialLifeSpan;
        }
      });
    }
  }, {
    key: "setValue",
    value: function setValue(key, value) {
      this[key] = value;
      if (this[key]) {
        this[key].lifeSpanCounter = this.initialLifeSpan;
      }
    }
  }, {
    key: "merge",
    value: function merge(newSlots) {
      this._assignProperties((0, _extends3.default)({}, this, newSlots));
    }
  }, {
    key: "replaceByDefaultValue",
    value: function replaceByDefaultValue(matchedCondition) {
      var _this5 = this;

      this.slotKeys.forEach(function (key) {
        if (_this5[key]) {
          return;
        }
        var matchedAsDefaultValue = (matchedCondition[key] || "").match(/\[.*?\]/);
        if (matchedAsDefaultValue) {
          var defaultValue = matchedAsDefaultValue[0].replace(/(\[|\])/g, "");
          _this5.setValue(key, { keyword: defaultValue });
        }
      });
    }
  }]);
  return ContextSlots;
}();

exports.default = ContextSlots;