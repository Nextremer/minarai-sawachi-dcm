"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getYYYYMMDDStringFromDate = getYYYYMMDDStringFromDate;
exports.getDateFromYYYYMMDDString = getDateFromYYYYMMDDString;
exports.getJPFormatDateString = getJPFormatDateString;
exports.getAgeByBirthday = getAgeByBirthday;
exports.getFormatDate = getFormatDate;
exports.getCurrentDate = getCurrentDate;
exports.getTimeStampString = getTimeStampString;
exports.convertToArray = convertToArray;
exports.takeRandomly = takeRandomly;
exports.replaceBlank = replaceBlank;
exports.randomInt = randomInt;
exports.deleteUndefined = deleteUndefined;
exports.easyDeepCopy = easyDeepCopy;
exports.pickRandomly = pickRandomly;
exports.replaceBlankText = replaceBlankText;
exports.replaceCustomBrTag = replaceCustomBrTag;

var _shuffleArray = require("shuffle-array");

var _shuffleArray2 = _interopRequireDefault(_shuffleArray);

var _requestPromise = require("request-promise");

var rp = _interopRequireWildcard(_requestPromise);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getYYYYMMDDStringFromDate(date) {
  return (0, _moment2.default)(date).format("YYYYMMDD");
}
function getDateFromYYYYMMDDString(YYYYMMDD) {
  return (0, _moment2.default)(String(YYYYMMDD)).toDate();
}

function getJPFormatDateString(date) {
  return (0, _moment2.default)(date).format("YYYY年M月D日");
}
function getAgeByBirthday(date) {
  return (0, _moment2.default)(getCurrentDate()).diff((0, _moment2.default)(date), "years");
}
function getFormatDate(date) {
  return (0, _moment2.default)(date, "YYYYMMDDHHmmss").format("M/D H:mm");
}

function getCurrentDate() {
  var m = process.env.CURRENT_DATE ? (0, _moment2.default)(process.env.CURRENT_DATE) : (0, _moment2.default)();
  return m.toDate();
}

function getTimeStampString() {
  return getCurrentDate().getTime().toString();
}

function convertToArray(input) {
  return Array.isArray(input) ? input : [input];
}

function takeRandomly(array, number) {
  var shuffledArray = (0, _shuffleArray2.default)(array, { copy: true });
  return shuffledArray.slice(0, number);
}

function replaceBlank(input, defaultValue) {
  if (input !== "" && input !== 0 && !input) {
    return defaultValue || "-";
  }
  return input;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function deleteUndefined(object) {
  Object.keys(object).map(function (k) {
    return k;
  }).forEach(function (k) {
    if (!object[k]) {
      delete object[k];
    }
  });
  return object;
}

function easyDeepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

function pickRandomly(myArray) {
  return myArray[Math.floor(Math.random() * myArray.length)];
}
function replaceBlankText(text) {
  return (text || "").replace(/(　|\ )/g, "");
  myArray[Math.floor(Math.random() * myArray.length)];
}

function replaceCustomBrTag(text) {
  return (text || "").replace(/\{br\}/g, "\n");
}

// 年の差
// moment().diff(m( date ), "years");