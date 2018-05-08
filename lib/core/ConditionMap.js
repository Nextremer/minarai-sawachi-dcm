const rp = require("request-promise");

export class ConditionMap{
  map = null;
  static instance;
  static getInstance( conditionMapOptions , forceReCreate ){
    if( !ConditionMap.instance || forceReCreate ){
      ConditionMap.instance = new ConditionMap( conditionMapOptions );
    }
    return ConditionMap.instance;
  }

  constructor( conditionMapOptions ){
    this.source = {
      json: new MapResourceJson( conditionMapOptions.sourceOptions ),
      object: new MapResourceObject( conditionMapOptions.sourceOptions ),
      testLocal: new MapResourceLocal( conditionMapOptions.sourceOptions ),
    }[conditionMapOptions.source];
    this.fetchForEachRequest = conditionMapOptions.fetchForEachRequest;
  }

  async get(){
    if( this.fetchForEachRequest || !this.map ){
      this.map = await this.source.fetch();
    }
    return this.map;
  }

  clear(){
    this.map = null;
  }
}


class MapResource{
  constructor( sourceOptions ){
    this.sourceOptions = sourceOptions;
  }

  fetch(){
  }
}

class MapResourceJson extends MapResource {
  fetch() {
    const {map} = this.sourceOptions;
    return new Promise((resolve, reject) => {
      resolve(JSON.parse(map));
    });
  }
}

class MapResourceObject extends MapResource {
  fetch() {
    const {map} = this.sourceOptions;
    return new Promise((resolve, reject) => {
      resolve(map);
    });
  }
}

class MapResourceLocal extends MapResource{
  fetch(){
    return new Promise((resolve, reject)=>{
      resolve(TEST_MAP);
    });
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

