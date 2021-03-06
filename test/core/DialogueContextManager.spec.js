
import fs from "fs";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { easyDeepCopy } from "@/utils/other_utils";

import * as config from "config";
import DialogueContextManager from "@/core/DialogueContextManager";

chai.use(chaiAsPromised);
const should = chai.should();
const { expect, assert } = chai;

const extraSlotKeys = ["hoge","hoge2","hoge3"];
const extraSlotKeysSeriku = ["gender","event","period"];
const LIFE_SPAN = 2;

describe("DialogueContext", ()=>{
  const testOptions = ()=>{
    let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
    return {
      applicationId: `dummyApplicationId999${new Date().getTime()}`,
      conditionMap: {
        source: "json",
        sourceOptions: {
          map: jsonfile,
        },
        fetchForEachRequest: false,
      },
      redis: config.redis,
      extraSlotKeys: extraSlotKeys,
      initialLifeSpan: LIFE_SPAN,
      holdUsedSlot: true,
    };
  };

  context("#constructor", ()=>{
    it ("正常終了", async ()=>{
      const m = await DialogueContextManager.getInstance( testOptions() );
    });
    it ("ApplicationIDなしで例外Throw", ()=>{
      expect(DialogueContextManager.getInstance( delete testOptions().applicationId )).to.be.rejectedWith(Error);
    });
  });

  context("#validateInput", ()=>{
    it ("extraSlotKeysに指定されているkeyで、keywordの無いもの(空文字は許可)を弾く", async ()=>{
      const m = await DialogueContextManager.getInstance( testOptions() );
      //expect( m.validateInput({ hoge: { noKeyword: ""} }) ).to.;
      expect( m.validateInput({ hoge: { keyword: ""} }) ).to.be.empty;
      expect( m.validateInput({ hoge: { nonkeyword: ""} }) ).to.have.lengthOf(1);

    });
    it ("topicはidが必須", async ()=>{
      const m = await DialogueContextManager.getInstance( testOptions() );
      expect( m.validateInput({ topic: { id: ""} }) ).to.be.empty;
      expect( m.validateInput({ topic: { nonid: ""} }) ).to.have.lengthOf(1);

    });
    it ("targetはtype,keywordが共に必須", async ()=>{
      const m = await DialogueContextManager.getInstance( testOptions() );
      expect( m.validateInput({ target: { type: "", keyword: ""} }) ).to.be.empty;
      expect( m.validateInput({ target: { type: ""} }) ).to.have.lengthOf(1);
      expect( m.validateInput({ target: { keyword: ""} }) ).to.have.lengthOf(1);
    });
    it ("複数の条件に抵触した場合、全てのエラーを返す", async ()=>{
      const m = await DialogueContextManager.getInstance( testOptions() );
      expect( m.validateInput({ target: { type: "", keyword: ""}, hoge: { keyword: "" }, topic: { id: "id" } }) ).to.be.empty;
      expect( m.validateInput({ target: { }, hoge: { }, topic: { } }) ).to.have.lengthOf(3);
    });
  });

  context("#getNewContext", () => {
    it("topic idがnullのとき'-'に置換される", async () => {
      const m = await DialogueContextManager.getInstance(testOptions());
      const ctx = await m.getNewContext("dummyUser000", { body: { topic: { id: null } } });
      expect(ctx.latestInput.body.topic.id).equals("-");
    });
  });

  context("#conditionMapExists", () => {
    const appId = `dummyApplicationId300${new Date().getTime()}`;
    const dcmOptions = {
      applicationId: appId,
      conditionMap: {
        source: "object",
        sourceOptions: {
          map: [{topic: "dummy", target: "-", actionId: "dummy"}]
        },
        fetchForEachRequest: false,
      },
      redis: config.redis,
      initialLifeSpan: 2,
      holdUsedSlot: true,
    };

    it ("redisにapplicationIdに紐づくConditionMapがないときには false が返ってくること", async () => {
      let exists = await DialogueContextManager.conditionMapExists(appId, config.redis);
      expect(exists).to.equal(false);
    });

    it ("redisにapplicationIdに紐づくConditionMapがあるときには true が返ってくること", async () => {
      let exists = await DialogueContextManager.conditionMapExists(appId, config.redis);
      const _m = await DialogueContextManager.getInstance( dcmOptions );
      exists = await DialogueContextManager.conditionMapExists(appId, config.redis);
      expect(exists).equal(true);
    });
  });

  // context("#DialogueContextManager", ()=>{
  //   const options = testOptions();
  //   options.extraSlotKeys = extraSlotKeysSeriku;
  //   const m = new DialogueContextManager(  options  );
  //   const userId = "user00";
  //   it ("正常終了", async ()=>{
  //     const ctx1 = await m.getNewContext( userId, { isAvailable: true, body: { target: { type: "serina", keyword: "serina" }  }});
  //   });
  // });

});
