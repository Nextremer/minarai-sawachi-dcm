import RedisPool from "../utils/redisPool";

const rp = require("request-promise");

export class ConditionMap {
  map = null;
  static async getInstance(applicationId, conditionMapOptions, redisConfig) {
    const cm = new ConditionMap();
    await cm._init(applicationId, conditionMapOptions, redisConfig);
    return cm;
  }

  //TODO: BluebirdのRedisでキーの存在チェックできる？

  async _init(applicationId, conditionMapOptions, redisConfig) {
    if (
      applicationId === undefined ||
      applicationId === null ||
      applicationId === ""
    ) {
      throw new Error(`applicationId is invalid: ${applicationId}`);
    }

    conditionMapOptions.applicationId = applicationId;
    conditionMapOptions.redis = redisConfig;

    this.source = await this._sourceSelector(conditionMapOptions);
    this.fetchForEachRequest = conditionMapOptions.fetchForEachRequest;
  }

  async _sourceSelector(conditionMapOptions) {
    const source = conditionMapOptions.source;

    if (source === "json")
      return await MapResource.initializeWithJSON(conditionMapOptions);

    if (source === "object")
      return await MapResource.initializeWithObject(conditionMapOptions);

    if (source === "redis")
      return await MapResource.initializeWithRedis(conditionMapOptions);

    if (source === "testLocal")
      return new MapResourceLocal(conditionMapOptions);

    throw new Error(`No valid source type specified: ${source}`);
  }

  async fetch() {
    if (this.fetchForEachRequest || !this.map) {
      const map = await this.source.fetch();
      this.map = map;
    }
  }

  async get() {
    return await this.getMap();
  }

  async getMap() {
    await this.fetch();
    return this.map.conditionMap;
  }

  async getExtraSlotKeys() {
    await this.fetch();
    return this.map.extraSlotKeys;
  }

  /**
   * ConditionMapがRedis上に存在するかどうか確認する。
   *
   * @returns {Promise<boolean>} あればTrue, なければFalse。
   */
  mapExists() {
    const r = this.source.exists();
    return r;
  }

  clear() {
    this.map = null;
  }
}

class MapResource {
  static async initializeWithJSON(conditionMapOptions) {
    const res = new MapResourceJson(conditionMapOptions);
    await res.init();
    return res;
  }

  static async initializeWithObject(conditionMapOptions) {
    const res = new MapResourceObject(conditionMapOptions);
    await res.init();
    return res;
  }

  static async initializeWithRedis(conditionMapOptions) {
    const res = new MapResourceRedis(conditionMapOptions);
    await res.init();
    return res;
  }

  constructor(conditionMapOptions) {
    const {
      applicationId,
      redis,
      sourceOptions,
      extraSlotKeys,
    } = conditionMapOptions;
    this.sourceOptions = sourceOptions;
    this.applicationId = applicationId;
    this.redis = redis;
    this.map = null; // 取得した ConditionMap + ExtraSlotKeys

    if (!(extraSlotKeys === undefined && extraSlotKeys instanceof Array)) {
      this.extraSlotKeys = extraSlotKeys;
    }

    this._init = async () => {};
  }

  async init() {
    await this._init();
  }

  /**
   * RedisからConditionMapの内容を取得する
   *
   * インスタンス生成時にextraSlotKeysが設定されていれば、
   * 取得したConditionMapに関連するextraSlotKeysを、
   * インスタンス生成時のもので上書きをする。
   *
   * @returns conditionMapの内容
   * @throws Error RedisからconditionMapの取得に失敗したとき例外 `Error` を送出する。
   */
  async fetch() {
    const redisPool = RedisPool.getPool(this.redis);
    let map = await redisPool
      .getAsync(`ConditionMap/${this.applicationId}`)
      .then(res => {
        return JSON.parse(res);
      })
      .catch(() => {
        throw new Error(
          `Unable to retrieve a condition map from redis for application ${
            this.applicationId
          }`,
        );
      });

    if (Array.isArray(map)) {
      // 取得したものが配列なら extraSlotKeys 情報が付加されていない ConditionMap とみなす
      map = { conditionMap: map, extraSlotKeys: [] };
      //TODO: map の内容から extraSlotKeysを推論させる？
    } else if (map instanceof Object && map.hasOwnProperty("topic")) {
      // 取得したものがオブジェクトだったら ConditionMap の単体が入っている可能性もある
      // topic keyがあるかどうかで判定
      map = { conditionMap: [map], extraSlotKeys: [] };
    } else if (map instanceof Object && map.hasOwnProperty("conditionMap")) {
      // 取得したオブジェクトに "conditionMap" があれば、形式が適合しているものとしてそのまま使用する
    } else {
      // それ以外のとき、Error を Throw する
      throw new Error(
        `Stored Condition Map for ${this.applicationId} has invalid form.`,
      );
    }

    // extraSlotKeys が初期値として与えられていたなら、それで上書きをする
    if (this.extraSlotKeys) {
      map.extraSlotKeys = this.extraSlotKeys;
    }
    this.map = map;

    // Redis の有効期限を延長しておく
    await this.updateRedisTtl();

    return map;
  }

  async exists() {
    const redisPool = RedisPool.getPool(this.redis);
    const result = await redisPool
      .ttlAsync(`ConditionMap/${this.applicationId}`)
      .then(res => {
        // TTL が -2 はキーがないとき。 -1 は無期限。0以上は有効期限(秒)
        // したがって、キーがあって、正常な期限があること
        return res !== -2 && res >= -1;
      })
      .catch(() => {
        throw new Error(
          `Unable to retrieve a condition map key from redis for application ${
            this.applicationId
          }`,
        );
      });
    return result;
  }

  /**
   * ConditionMap の TTL を設定する
   * @param ttl TTL (秒) デフォルトは 30 日
   * @returns {Promise<boolean>}
   */
  async updateRedisTtl(ttl = MONTH) {
    const redisPool = RedisPool.getPool(this.redis);
    const resultExpiration = await redisPool
      .expireAsync(`ConditionMap/${this.applicationId}`, ttl > 0 ? ttl : MONTH)
      .then(res => {
        return res;
      })
      .catch(e => {
        throw e;
      });
    return resultExpiration === 1;
  }

  /**
   * Redis に ConditionMap を JSON で保存する
   *
   * Redisに保存されるKeyは `ConditionMap/` が Prefix の `applicationId`.
   * `applicationId` は Constructor に渡されたものを使う。
   *
   * @param mapJson JSON形式のConditionMap。文字列
   * @param ttl
   * @returns {Promise<{result: {store: boolean, expiration: boolean}}>} データの保存と有効期限のセットの成否がbooleanで表現される
   */
  async store(mapJson, ttl = MONTH) {
    const redisPool = await RedisPool.getPool(this.redis);
    const resultSet = await redisPool
      .setAsync(`ConditionMap/${this.applicationId}`, mapJson)
      .then(res => {
        return res;
      })
      .catch(e => {
        throw e;
      });

    const resultExpiration = await redisPool
      .expireAsync(`ConditionMap/${this.applicationId}`, ttl > 0 ? ttl : MONTH)
      .then(res => {
        return res;
      })
      .catch(e => {
        throw e;
      });

    return {
      result: { store: resultSet === "OK", expiration: resultExpiration === 1 },
    };
  }
}

class MapResourceJson extends MapResource {
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    const { map } = this.sourceOptions;
    const extraSlotKeys = this.extraSlotKeys ? this.extraSlotKeys : [];

    this._init = async () => {
      await this.store(
        JSON.stringify({
          conditionMap: JSON.parse(map),
          extraSlotKeys: extraSlotKeys,
        }),
      );
    };
  }
}

class MapResourceObject extends MapResource {
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    const { map } = this.sourceOptions;
    const extraSlotKeys = this.extraSlotKeys ? this.extraSlotKeys : [];

    this._init = async () => {
      await this.store(
        JSON.stringify({
          conditionMap: map,
          extraSlotKeys: extraSlotKeys,
        }),
      );
    };
  }
}

class MapResourceLocal extends MapResource {
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    const extraSlotKeys = this.extraSlotKeys ? this.extraSlotKeys : [];

    this._init = async () => {
      await this.store(
        JSON.stringify({
          conditionMap: TEST_MAP,
          extraSlotKeys: extraSlotKeys,
        }),
      );
    };
  }
}

class MapResourceRedis extends MapResource {
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    this._init = async () => {
      // extraSlotKeysが指定されていたら同期を取る
      if (this.extraSlotKeys) {
        await this._syncMap();
      }
    };
  }

  async _syncMap() {
    await this.fetch();
    this.map.extraSlotKeys = this.extraSlotKeys;
    await this.store(JSON.stringify(this.map));
  }
}

const HOUR = 3600;
const DAY = HOUR * 24;
const MONTH = DAY * 30;

/*eslint-disable */
const TEST_MAP = [ { topic: 'profile',
  target: 'player',
  gender: '-',
  event: '-',
  period: '-',
  actionId: 'player_profile' },
  { topic: 'profile',
    target: 'player',
    gender: '-',
    event: '-',
    period: '-',
    actionId: '絶対にこないはず なぜなら一つ上と条件が同じだから' },
  { topic: 'profile',
    target: 'country',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'country_profile' },
  { topic: 'profile',
    target: 'serina',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'serina_profile' },
  { topic: 'profile',
    target: '-',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'unknown_profile' },
  { topic: 'default_value',
    target: '-',
    gender: '[female]',
    event: '[all]',
    period: '[current]',
    actionId: 'default_value_all' },
  { topic: 'default_value_case2',
    target: 'player',
    gender: '*',
    event: '*',
    period: '[do_not_write]',
    actionId: 'default_case2_1' },
  { topic: 'default_value_case2',
    target: 'player',
    gender: '*',
    event: '[do_not_write]',
    period: '*',
    actionId: 'default_case2_2' },
  { topic: 'default_value_case2',
    target: 'player',
    gender: '[do_not_write]',
    event: '*',
    period: '*',
    actionId: 'default_case2_3' },
  { topic: 'default_value_case2',
    target: 'country',
    gender: '[female]',
    event: '[200m]',
    period: 'current',
    actionId: 'default_case2_4' },
  { topic: 'default_value_case2',
    target: 'player',
    gender: '*',
    event: '*',
    period: '*',
    actionId: 'default_case2_5' },
  { topic: 'default_value_case2',
    target: 'player',
    gender: '[male]',
    event: '[110m]',
    period: '[last]',
    actionId: 'default_case2_6' },
  { topic: 'toilet',
    target: '-',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'toilet' },
  { topic: '-',
    target: 'player',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'about_player' },
  { topic: '-',
    target: 'country',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'about_country' },
  { topic: '-',
    target: 'serina',
    gender: '-',
    event: '-',
    period: '-',
    actionId: 'about_serina' },
  { topic: '-',
    target: '-',
    gender: '*',
    event: '-',
    period: '-',
    actionId: 'about_gender' },
  { topic: '-',
    target: '-',
    gender: '-',
    event: '*',
    period: '-',
    actionId: 'about_event' },
  { topic: '-',
    target: '-',
    gender: '-',
    event: '-',
    period: '*',
    actionId: 'about_period' } ];
/*eslint-enable */
