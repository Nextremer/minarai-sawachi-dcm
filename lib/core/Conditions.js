const IGNORE_OPERATOR = "-";
const EQUAL_OPERATOR = "=";
const UNFILLED_OPERATOR = "?";
export const WILD_CARD = "*";
export const DEFAULT_RESPONSE_ACTION_ID = "default_response";

export default class Conditions {
  map = [];
  context = {};

  constructor(map, extraSlotKeys, context) {
    this.map = map;
    this.extraSlotKeys = extraSlotKeys;
    this.context = context;
  }

  getMatchedCondition() {
    if (!this.context.latestInput.isAvailable) {
      return { actionId: DEFAULT_RESPONSE_ACTION_ID };
    }
    // 共通する話題に触れているなら topic id を取得
    const topicId = this.getTopicIdToTake();

    // 共通する話題に触れていないなら、覚えていた topic id を忘れる
    if (isIgnoreOperator(topicId)) {
      this.context.body.resetTopic();
    }
    // その上で、関連しそうな conditions をすべて取得する
    const conditions = this.getConditionsByTopicId(topicId);

    // topicにマッチしたconditionをふるいにかける
    const candidates = conditions.filter(condition => {
      // target が一致？
      const targetMatched = this.targetMatcher(true, condition, this.context);
      // その他の項目もマッチする？
      const extraKeysMatchedArray = this.extraSlotKeys.map(key => {
        return this.additionalInfoMatcher(true, condition, key, this.context);
      });
      // 全部の項目にマッチした condition を生き残らせる
      const allMatched = ![targetMatched, ...extraKeysMatchedArray].includes(
        false,
      );
      return allMatched;
    });

    // 生き残った condition について、
    const scores = candidates.map(condition => {
      // エンジンからの入力の `target` がこれまでの会話から変化しているかどうかを調べる
      const targetMatched = this.targetMatcher(
        false,
        condition,
        this.context.latestInput,
      );
      const extraKeysMatchedArray = this.extraSlotKeys.map(key => {
        return this.additionalInfoMatcher(false, condition, key, this.context);
      });

      // マッチした数を数えてそれをスコアとする
      const s = {
        score: countTrueValue([targetMatched, ...extraKeysMatchedArray]),
      };
      return {
        ...condition,
        ...s,
      };
    });

    // 最高のスコアの condition のうち、一番最初のものを Matched Condition とする
    const maxScore = Math.max(...scores.map(s => s.score));

    return (
      scores.filter(s => s.score === maxScore)[0] || {
        actionId: DEFAULT_RESPONSE_ACTION_ID,
      }
    );
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
  contextTopicRequires(key) {
    // 引き継いだcontextのtopicに対応するconditionを準備する
    const topicId = (this.context.body.topic || { id: IGNORE_OPERATOR }).id;
    const conditions = this.getConditionsByTopicId(topicId);

    // topicに関連するcondition定義の群から、
    // 指定された `key` に対応する値が IgnoreOperator ではない最初の condition を取り出す
    return conditions.find(c => {
      if (key === "target") {
        return c.target === (this.context.body.target || {}).type;
      } else {
        return !isIgnoreOperator(c[key]);
      }
    });
  }

  getConditionsByTopicId(topicId) {
    return this.map.filter(row => {
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
  targetMatcher(allowIgnore, condition, context) {
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
  additionalInfoMatcher(allowIgnoreAndDefault, condition, bodyKey, context) {
    if (!condition[bodyKey]) {
      const error = `SlotKey "${bodyKey}" does not exist on ConditionMap. Check if you specify extraSlotKeys option properly.`;
      throw new Error(error);
    }

    allowIgnoreAndDefault = !!allowIgnoreAndDefault;

    const matchedAsDefaultValue = condition[bodyKey].match(/\[.*?\]/);

    if (isIgnoreOperator(condition[bodyKey]) || matchedAsDefaultValue) {
      return allowIgnoreAndDefault;
    }

    const candidateValues = condition[bodyKey].split(",");

    const bodyHasKey = bodyKey in context.body;
    // candidateValues に `undefined` がない前提
    const keyword = (context.body[bodyKey] || {}).keyword;

    const conditionIsWildCard = condition[bodyKey] === WILD_CARD;
    const conditionIsUnfilledSlot = condition[bodyKey] === UNFILLED_OPERATOR;
    const contextIsUnfilledSlot = bodyHasKey && keyword === UNFILLED_OPERATOR;

    // WildCard `*` は context.body[bodyKey] があり
    // かつ空文字や"-"でないときにマッチする
    const matchedWildCard =
      conditionIsWildCard &&
      bodyHasKey &&
      (allowIgnoreAndDefault ||
        (context.body[bodyKey].keyword !== "" &&
          context.body[bodyKey].keyword !== "-"));
    // Unfilled `?` は
    // 1) 入力が空きだったときにマッチする
    // 2) もしくは入力が `?` で条件がなにかあるときにマッチする
    const matchedUnfilled =
      (conditionIsUnfilledSlot && !bodyHasKey) ||
      (contextIsUnfilledSlot &&
        condition[bodyKey] !== null &&
        condition[bodyKey] !== "");

    return (
      matchedWildCard || matchedUnfilled || candidateValues.includes(keyword)
    );
  }

  getTopicIdToTake() {
    // エンジンからの入力の `topic` を取り出す
    const consensusTopic = this.context.latestInput.body.topic;

    // エンジンからの入力のTopicに `id` があればそれを返す
    if (consensusTopic && consensusTopic.id) {
      return consensusTopic.id;
    }

    // エンジンからの入力に `topic` がない場合には
    const keys = ["target", ...this.extraSlotKeys];

    // それぞれの `key` について、
    // エンジンからの入力に対応する値がある && 引き継いだcontextに対応する値がある
    // →何か共通して触れているものがあるかどうかを調べる
    const contextTopicUsesConsensusValue = keys
      .map(key => {
        const value = this.context.latestInput.body[key];
        return !!(value && this.contextTopicRequires(key));
      })
      .includes(true);

    // 全く関連性がない場合には IGNORE_OPERATOR を引き続き topic id とし、
    if (!contextTopicUsesConsensusValue) {
      return IGNORE_OPERATOR;
    }

    // 前回から引き継いだ context の topic id があればそれを今回の topic id とする
    return (this.context.body.topic || { id: IGNORE_OPERATOR }).id;
  }
}

/**
 * 条件が使われているか判定する
 *
 * @param condition
 * @param key
 * @returns {boolean} 条件が使われていれば true, 条件として「除外」演算子が使われている場合と、条件が使われていない場合には `false`
 */
export function conditionUses(condition, key) {
  if (!condition || !condition[key]) {
    return false;
  }
  //return ![ IGNORE, WILD_CARD ].includes( condition[key] );
  return ![IGNORE_OPERATOR].includes(condition[key]);
}

function countTrueValue(array) {
  return array.filter(val => !!val).length;
}

function isIgnoreOperator(operator) {
  return [IGNORE_OPERATOR, EQUAL_OPERATOR].includes(operator);
}
