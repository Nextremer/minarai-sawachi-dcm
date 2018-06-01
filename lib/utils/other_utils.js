import shuffle from "shuffle-array";
import * as rp from "request-promise";
import moment from "moment";
export function getYYYYMMDDStringFromDate(date) {
  return moment(date).format("YYYYMMDD");
}
export function getDateFromYYYYMMDDString(YYYYMMDD) {
  return moment(String(YYYYMMDD)).toDate();
}

export function getJPFormatDateString(date) {
  return moment(date).format("YYYY年M月D日");
}
export function getAgeByBirthday(date) {
  return moment(getCurrentDate()).diff(moment(date), "years");
}
export function getFormatDate(date) {
  return moment(date, "YYYYMMDDHHmmss").format("M/D H:mm");
}

export function getCurrentDate() {
  const m = process.env.CURRENT_DATE
    ? moment(process.env.CURRENT_DATE)
    : moment();
  return m.toDate();
}

export function getTimeStampString() {
  return getCurrentDate()
    .getTime()
    .toString();
}

export function convertToArray(input) {
  return Array.isArray(input) ? input : [input];
}

export function takeRandomly(array, number) {
  const shuffledArray = shuffle(array, { copy: true });
  return shuffledArray.slice(0, number);
}

export function replaceBlank(input, defaultValue) {
  if (input !== "" && input !== 0 && !input) {
    return defaultValue || "-";
  }
  return input;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function deleteUndefined(object) {
  Object.keys(object)
    .map(k => k)
    .forEach(k => {
      if (!object[k]) {
        delete object[k];
      }
    });
  return object;
}

export function easyDeepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

export function pickRandomly(myArray) {
  return myArray[Math.floor(Math.random() * myArray.length)];
}
export function replaceBlankText(text) {
  return (text || "").replace(/(　|\ )/g, "");
  myArray[Math.floor(Math.random() * myArray.length)];
}

export function replaceCustomBrTag(text) {
  return (text || "").replace(/\{br\}/g, "\n");
}

// 年の差
// moment().diff(m( date ), "years");
