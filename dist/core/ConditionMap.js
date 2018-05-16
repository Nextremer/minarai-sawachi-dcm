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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rp = require("request-promise");

var ConditionMap = exports.ConditionMap = function () {
  (0, _createClass3.default)(ConditionMap, null, [{
    key: "getInstance",
    value: function getInstance(applicationId, conditionMapOptions) {
      return new ConditionMap(applicationId, conditionMapOptions);
    }
  }]);

  function ConditionMap(applicationId, conditionMapOptions) {
    (0, _classCallCheck3.default)(this, ConditionMap);
    this.map = null;

    if (applicationId === undefined) {
      throw Error("");
    }
    if (applicationId === null) {
      throw Error("");
    }
    if (applicationId === "") {
      throw Error("");
    }

    conditionMapOptions.applicationId = applicationId;

    this.source = {
      json: new MapResourceJson(conditionMapOptions),
      object: new MapResourceObject(conditionMapOptions),
      testLocal: new MapResourceLocal(conditionMapOptions)
    }[conditionMapOptions.source];
    this.fetchForEachRequest = conditionMapOptions.fetchForEachRequest;
  }

  (0, _createClass3.default)(ConditionMap, [{
    key: "get",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.fetchForEachRequest || !this.map)) {
                  _context.next = 4;
                  break;
                }

                _context.next = 3;
                return this.source.fetch();

              case 3:
                this.map = _context.sent;

              case 4:
                return _context.abrupt("return", this.map);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function get() {
        return _ref.apply(this, arguments);
      }

      return get;
    }()
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
        sourceOptions = conditionMapOptions.sourceOptions;

    this.sourceOptions = sourceOptions;
    this.applicationId = applicationId;
  }

  (0, _createClass3.default)(MapResource, [{
    key: "fetch",
    value: function fetch() {}
  }]);
  return MapResource;
}();

var MapResourceJson = function (_MapResource) {
  (0, _inherits3.default)(MapResourceJson, _MapResource);

  function MapResourceJson() {
    (0, _classCallCheck3.default)(this, MapResourceJson);
    return (0, _possibleConstructorReturn3.default)(this, (MapResourceJson.__proto__ || Object.getPrototypeOf(MapResourceJson)).apply(this, arguments));
  }

  (0, _createClass3.default)(MapResourceJson, [{
    key: "fetch",
    value: function fetch() {
      var map = this.sourceOptions.map;

      var conditionMap = JSON.parse(map);

      return new Promise(function (resolve, reject) {
        resolve(conditionMap);
      });
    }
  }]);
  return MapResourceJson;
}(MapResource);

var MapResourceObject = function (_MapResource2) {
  (0, _inherits3.default)(MapResourceObject, _MapResource2);

  function MapResourceObject() {
    (0, _classCallCheck3.default)(this, MapResourceObject);
    return (0, _possibleConstructorReturn3.default)(this, (MapResourceObject.__proto__ || Object.getPrototypeOf(MapResourceObject)).apply(this, arguments));
  }

  (0, _createClass3.default)(MapResourceObject, [{
    key: "fetch",
    value: function fetch() {
      var map = this.sourceOptions.map;

      return new Promise(function (resolve, reject) {
        resolve(map);
      });
    }
  }]);
  return MapResourceObject;
}(MapResource);

var MapResourceLocal = function (_MapResource3) {
  (0, _inherits3.default)(MapResourceLocal, _MapResource3);

  function MapResourceLocal() {
    (0, _classCallCheck3.default)(this, MapResourceLocal);
    return (0, _possibleConstructorReturn3.default)(this, (MapResourceLocal.__proto__ || Object.getPrototypeOf(MapResourceLocal)).apply(this, arguments));
  }

  (0, _createClass3.default)(MapResourceLocal, [{
    key: "fetch",
    value: function fetch() {
      return new Promise(function (resolve, reject) {
        resolve(TEST_MAP);
      });
    }
  }]);
  return MapResourceLocal;
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