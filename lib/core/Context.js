import ContextSlots from "./ContextSlots";

export default class Context {
  userId = "";
  latestInput = undefined;
  //latestRequest = undefined;
  matchedCondition = undefined;
  extra = {};

  constructor(userId, redisPool, config) {
    const { extraSlotKeys, initialLifeSpan, holdUsedSlot } = config;
    this.redisPool = redisPool;
    this.userId = userId;
    this.extraSlotKeys = extraSlotKeys;
    this.holdUsedSlot = holdUsedSlot;
    this.initialLifeSpan = initialLifeSpan;
    this.body = new ContextSlots(
      { extraSlotKeys, initialLifeSpan, holdUsedSlot },
      {},
    );
  }
  createNewContextSlots(newInput) {
    return new ContextSlots(
      {
        extraSlotKeys: this.extraSlotKeys,
        initialLifeSpan: this.initialLifeSpan,
      },
      newInput,
    );
  }

  // TODO : 新しい機能として...
  //reBuild(){
  //  const newBody = new ContextSlots(  initialLifeSpan, {});
  //  this.body.merge( ContextSlots.fromEnginesConsensus( this ));
  //}

  serialize() {
    const { userId, latestInput, matchedCondition, body, extra } = this;
    return JSON.stringify({
      userId,
      latestInput,
      matchedCondition,
      body,
      extra,
    });
  }

  async persist(ttl = WEEK) {
    const resultSet = await this.redisPool
      .setAsync(this.userId, this.serialize())
      .catch(e => {
        console.error("contextの保存に失敗しました。", e);
      });

    const resultExpiration = await this.redisPool
      .expireAsync(this.userId, ttl > 0 ? ttl : WEEK)
      .catch(e => {
        console.error("contextの有効期限の設定に失敗しました。", e);
      });

    return {
      result: { store: resultSet === "OK", expiration: resultExpiration === 1 },
    };
  }

  get(key) {
    return this.body[key];
  }

  setValue(key, value) {
    this.body.setValue(key, value);
  }

  /**
   * 各要素のlifeSpanCounterをデクリメントして、
   * ゼロより小さくなった要素を消去する
   */
  forget() {
    this.body.forget();
    return this;
  }

  /**
   * Redisに保存されたContextを削除する
   * @returns {*|Promise<T>}
   */
  clear() {
    return this.redisPool.delAsync(this.userId).catch(e => {
      console.error("contextの削除に失敗しました。", e);
    });
  }

  /**
   * 対話エンジンの出力結果を手持ちの情報に合成する
   *
   * @param enginesConsensus
   * @returns {Promise<void>}
   */
  async update(enginesConsensus) {
    this.latestInput = enginesConsensus;
    this.body.merge(this.createNewContextSlots(enginesConsensus.body));
  }

  setMatchedCondition(matchedCondition) {
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
  static async getOrInitial(userId, redisPool, options) {
    const { extraSlotKeys, initialLifeSpan, holdUsedSlot } = options;
    return await redisPool.getAsync(userId).then(r => {
      if (!r) {
        console.log("new context generated ");
        return new Context(userId, redisPool, {
          extraSlotKeys,
          initialLifeSpan,
          holdUsedSlot,
        });
      }

      const context = new Context(userId, redisPool, {
        extraSlotKeys,
        initialLifeSpan,
        holdUsedSlot,
      });
      const fromRedis = JSON.parse(r);
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
  }
}

const HOUR = 3600;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
