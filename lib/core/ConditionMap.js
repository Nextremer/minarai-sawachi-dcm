import RedisPool from "../utils/redisPool";

const rp = require("request-promise");

export class ConditionMap{
  map = null;
  static getInstance( applicationId, conditionMapOptions, redisConfig ){
    return new ConditionMap( applicationId, conditionMapOptions, redisConfig );
  }

  //TODO: BluebirdのRedisでキーの存在チェックできる？

  constructor( applicationId, conditionMapOptions, redisConfig ){
    if (applicationId === undefined || applicationId === null || applicationId === "") {
      throw new Error(`applicationId is invalid: ${applicationId}`);
    }

    conditionMapOptions.applicationId = applicationId;
    conditionMapOptions.redis = redisConfig;

    this.source = this._sourceSelector(conditionMapOptions);
    this.fetchForEachRequest = conditionMapOptions.fetchForEachRequest;
  }

  _sourceSelector(conditionMapOptions) {
    const source = conditionMapOptions.source;
    if (source === "json") return new MapResourceJson(conditionMapOptions);
    if (source === "object") return new MapResourceObject(conditionMapOptions);
    if (source === "redis") return new MapResourceRedis(conditionMapOptions);
    if (source === "testLocal") return new MapResourceLocal(conditionMapOptions);
    throw new Error(`No valid source type specified: ${source}`);
  }

  get(){
    if( this.fetchForEachRequest || !this.map ){
      this.map = this.source.fetch();
    }
    return this.map;
  }

  clear(){
    this.map = null;
  }
}


class MapResource{
  constructor( conditionMapOptions ) {
    const { applicationId, redis, sourceOptions } = conditionMapOptions;
    this.sourceOptions = sourceOptions;
    this.applicationId = applicationId;
    this.redis = redis;
  }

  /**
   * RedisからConditionMapの内容を取得する
   *
   * @returns conditionMapの内容
   * @throws Error RedisからconditionMapの取得に失敗したとき例外 `Error` を送出する。
   */
  async fetch() {
    const redisPool = RedisPool.getPool(this.redis);
    const result = await redisPool.getAsync(`ConditionMap/${this.applicationId}`).then(res => {
      return JSON.parse(res);
    }).catch(() => {
      throw new Error(`Unable to retrieve a condition map from redis for application ${this.applicationId}`);
    });
    return result;
  }

  /**
   * Redis に ConditionMap を JSON で保存する
   *
   * Redisに保存されるKeyは `ConditionMap/` が Prefix の `applicationId`.
   * `applicationId` は Constructor に渡されたものを使う。
   *
   * @param mapJson JSON形式のConditionMap。文字列
   * @returns {Promise<T>}
   * @private
   */
  async _store(mapJson) {
    const redisPool = RedisPool.getPool(this.redis);
    return await redisPool.setAsync(`ConditionMap/${this.applicationId}`, mapJson).then(res => {
      return res;
    }).catch((e) => {
      throw e;
    });
  }
}

class MapResourceJson extends MapResource {
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    const {map} = this.sourceOptions;
    this._store(map);
  }

}

class MapResourceObject extends MapResource {
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    const {map} = this.sourceOptions;
    this._store(JSON.stringify(map));
  }

}

class MapResourceLocal extends MapResource{
  constructor(conditionMapOptions) {
    super(conditionMapOptions);
    this._store(JSON.stringify(TEST_MAP));
  }

}

class MapResourceRedis extends MapResource {
  constructor(conditionMapOptions) {
    // 特別なことはしない = これをデフォルトとしたため
    super(conditionMapOptions);
  }

}

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

