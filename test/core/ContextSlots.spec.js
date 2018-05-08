import { expect } from "chai";
import { easyDeepCopy } from "@/utils/other_utils";

import ContextSlots from "@/core/ContextSlots";

const extraSlotKeys = ["gender","period","event", "command"];
const LIFE_SPAN = 2;
const IGNORE_KEYS = ["slotKeys", "initialLifeSpan", "holdUsedSlot"];

describe("ContextSlots", ()=>{

  const config = { extraSlotKeys: extraSlotKeys, initialLifeSpan: LIFE_SPAN };
  context("#merge", ()=>{
    it("引数で渡されたオブジェクトを優先し、 target,topic,gender,period,event,command キーの情報をマージする", ()=>{
      const body1 = new ContextSlots( config, { target: { key: "body1key" }, topic: { key: "body1key" }, gender: { key: "body1key" }, period: { key: "body1key" }});
      const body2 = new ContextSlots( config, { topic: { key: "body2key" }, gender: { key: "body2key" }, period: { key: "body2key" }, event: { key: "body2key" }, command: { key: "player_profile" }});
      body1.merge( body2 );
      deleteIgnoreKeys( body1 );
      deleteLifeSpan( body1 );
      expect( body1 ).to.deep.equal( { target: { key: "body1key" }, topic: { key: "body2key" }, gender: { key: "body2key" }, period: { key: "body2key" }, event: { key: "body2key" }, command: { key: "player_profile" }});
    });
  });
  context("#replaceByDefaultValue", ()=>{
    it("値が設定されていない場合に各種condition内部の [] で囲われた値を挿入する", async ()=>{

      const body1 = new ContextSlots( config, { gender: { keyword: "gender" } });
      const condition = { gender: "[man]" , event: "[100m]"};
      body1.replaceByDefaultValue( condition );

      expect( (body1.gender || {}).keyword ).to.be.equal( "gender" );
      expect( (body1.event || {}).keyword ).to.be.equal( "100m" );

    });
  });
  context("#constructor", ()=>{
    context("enginesConsensusにtarget,topic,event,period,gender要素が存在する場合", ()=>{
      it("ContextSlotsにtarget,topic,event,period,genderのキーが存在すること", async ()=>{
        const body = new ContextSlots(config, ENGINES_CONSENSUS_FULL_PLAYER() );
        //deleteIgnoreKeys( body );
        expect(body).to.have.any.keys("target", "topic","gender","period","event", "command");
      });
      it("ContextSlotsのtopic,event,period,genderに`lifeSpanCounter`が設置されていること", async ()=>{
        const body = new ContextSlots(config, ENGINES_CONSENSUS_FULL_PLAYER() );

        expect(body.target).to.have.any.keys("lifeSpanCounter");
        expect(body.topic).to.have.any.keys("lifeSpanCounter");
        expect(body.gender).to.have.any.keys("lifeSpanCounter");
        expect(body.event).to.have.any.keys("lifeSpanCounter");
        expect(body.period).to.have.any.keys("lifeSpanCounter");
        expect(body.command).to.have.any.keys("lifeSpanCounter");
      });
    });
    context("enginesConsensusにtarget,topic,event,period,gender,command要素が存在しない場合", ()=>{
      it("ContextSlotsにkey自体が存在しないこと", async ()=>{
        const body = new ContextSlots( config, ENGINES_CONSENSUS_NONE );
        expect(body).to.have.keys( ...IGNORE_KEYS);
      });
    });

  });
  context("#forget", ()=>{
    const config = { extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN };
    it("execute", async ()=>{
      const body = new ContextSlots( config, {
        topic: { id: "topicid" },
        hoge: { keyword: "hoge" },
        hoge2: { keyword: "hoge2" },
      });
      expect( body ).to.have.keys("topic" ,"hoge" ,"hoge2", ...IGNORE_KEYS);

      const newBody = new ContextSlots( config, {
        target: { type: "point" , keyword: "target" },
        hoge: { keyword: "hogehoge" },
      });
      
      body.forget();
      expect( body ).to.have.keys( "topic" ,"hoge" ,"hoge2", ...IGNORE_KEYS);
      expect( body.hoge.lifeSpanCounter ).to.equal( LIFE_SPAN - 1 );

      body.merge( newBody );
      body.forget();
      expect( body ).to.have.keys( "target" ,"topic" ,"hoge" ,"hoge2", ...IGNORE_KEYS);
      expect( body.hoge.lifeSpanCounter ).to.equal( LIFE_SPAN - 1 );

      body.forget();
      expect( body ).to.have.keys( "hoge", "target", ...IGNORE_KEYS );
      expect( body.hoge.lifeSpanCounter ).to.equal( LIFE_SPAN - 2 );
    });
  });
  context("#protectUsedKeys", ()=>{
    const config = { extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN };
    it("渡されたconditionのうち、利用するデータのlifespanを初期値にしてから計算する", async ()=>{
      const body = new ContextSlots( config, {
        topic: { id: "topicid" },
        hoge: { keyword: "hoge" },
        hoge2: { keyword: "hoge2" },
      });
      expect( body ).to.have.keys("topic" ,"hoge" ,"hoge2", ...IGNORE_KEYS);

      body.forget();
      body.protectUsedKeys({ hoge: "-", hoge2: "*" });

      expect( body.hoge.lifeSpanCounter ).to.equal( LIFE_SPAN - 1 );
      expect( body.hoge2.lifeSpanCounter ).to.equal( LIFE_SPAN );
    });
  });
});


const ENGINES_CONSENSUS_NONE = {
  "body": {}
};

function ENGINES_CONSENSUS_FULL_PLAYER(){ 
  return {
    "target": {
      "type": "player",
      "values": [
        {
          "keyword": "ボルト"
        }
      ]
    },
    "topic": {
      "id": "record",
      "utteranceValue": "の記録ですね。こちらをご覧ください。"
    },
    "gender": {
      "keyword": "men"
    },
    "event": {
      "keyword": "100m"
    },
    "period": {
      "keyword": "period-previous"
    },
    "command": {
      "id": "player_profile"
    },
  };
}

function ENGINES_CONSENSUS_FULL_COUNTRY(){
  const c = ENGINES_CONSENSUS_FULL_PLAYER();
  c.target.type = "country";
  c.target.values = [ { keyword: "日本" }];
  return c;
}
function ENGINES_CONSENSUS_FULL_MULTIPLE_COUNTRY(){
  const c = ENGINES_CONSENSUS_FULL_PLAYER();
  c.target.type = "country";
  c.target.values = [ { keyword: "日本" }, { keyword: "アメリカ" }];
  return c;
}

function ENGINES_CONSENSUS_FULL_PLAYER_EXPECT_MULTIPLE(){
  const c = ENGINES_CONSENSUS_FULL_PLAYER();
  c.target.values = [ { keyword: "マイケル" }];
  return c;
}
function ENGINES_CONSENSUS_FULL_PLAYER_EXPECT_NONE(){
  const c = ENGINES_CONSENSUS_FULL_PLAYER();
  c.bod.target.values = [ { keyword: "存在しない選手" }];
  return c;
}


function deleteIgnoreKeys( slots ){
  IGNORE_KEYS.forEach((key)=>{
    if( !slots.hasOwnProperty(key) ){ return; }
    delete slots[key];
  });
}
function deleteLifeSpan( slots ){
  Object.keys(slots).forEach((key)=>{
    if( !slots.hasOwnProperty(key) ){ return; }
    delete slots[key].lifeSpanCounter;
  });
}
