
import fs from "fs";
import { expect } from "chai";
import * as sinon from "sinon";
import { easyDeepCopy } from "@/utils/other_utils";

import * as config from "config";
import DialogueContextManager from "@/core/DialogueContextManager";
import { ConditionMap } from "@/core/ConditionMap";

const extraSlotKeys = ["gender","event","period"];
const LIFE_SPAN = 2;

describe("E2E", function() {

  const userId = `user000${new Date().getTime()}`;

  const testOptions = ()=>{
    let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
    return {
      applicationId: `dummyApplicationId100${new Date().getTime()}`,
      conditionMap: {
        source: "object",
        sourceOptions: {
          map: JSON.parse(jsonfile),
        },
        fetchForEachRequest: false,
      },
      redis: config.redis,
      extraSlotKeys: extraSlotKeys,
      initialLifeSpan: LIFE_SPAN,
      holdUsedSlot: true,
    };
  };
  const testOptionsForFilling = ()=>{
    let jsonfile = fs.readFileSync("./test/fixtures/filling.json");
    return {
      applicationId: `dummyApplicationId200${new Date().getTime()}`,
      conditionMap: {
        source: "json",
        sourceOptions: {
          map: jsonfile,
        },
        fetchForEachRequest: false,
      },
      redis: config.redis,
      extraSlotKeys: ["variation", "size", "number"],
      initialLifeSpan: LIFE_SPAN,
      holdUsedSlot: true,
    };
  };


  context("scenario", function () {
    ConditionMap.instance = null;
    it ("正常終了", async ()=>{
      const m = new DialogueContextManager( testOptions() );
      const ctx1 = await m.getNewContext( userId, generateInput(true, {
        gender: { keyword: "men" } 
      }));
      expect( ctx1.matchedCondition.actionId ).to.equal("unknown_gender");

      const ctx2 = await m.getNewContext( userId, generateInput(true, {
        topic: { id: "profile" },
        target: { type: "player", keyword: "ボルト" }
      }));
      expect( ctx2.matchedCondition.actionId ).to.equal("player_profile");


      const ctx3 = await m.getNewContext( userId, generateInput(true, {
        event: { keyword: "100m" },
      }));
      expect( ctx3.matchedCondition.actionId ).to.equal("about_event");

      const ctx4 = await m.getNewContext( userId, generateInput(true, {
        target: { type: "serina", keyword: "セリナ" }
      }));
      expect( ctx4.matchedCondition.actionId ).to.equal("about_serina");

      const ctx5 = await m.getNewContext( userId, generateInput(true, {
        topic: { id: "birthday" }
      }));
      expect( ctx5.matchedCondition.actionId ).to.equal("serina_birthday");

    }).timeout(10000);
  });


  context("filling scenario", function () {

    ConditionMap.instance = null;
    it ("正常終了", async ()=>{
      const m = new DialogueContextManager( testOptionsForFilling() );
      const ctx1 = await m.getNewContext( userId, generateInput(true, {
        topic: { id: "order_cake" }
      }));
      expect( ctx1.matchedCondition.actionId ).to.equal("ask_variation");

      const ctx2 = await m.getNewContext( userId, generateInput(true, {
        variation: { keyword: "ichigo" }
      }));
      expect( ctx2.matchedCondition.actionId ).to.equal("ask_size");


      const ctx3 = await m.getNewContext( userId, generateInput(true, {
        number: { keyword: "one" },
      }));
      expect( ctx3.matchedCondition.actionId ).to.equal("ask_size");

      const ctx4 = await m.getNewContext( userId, generateInput(true, {
        size: { keyword: "whole-size" }
      }));
      expect( ctx4.matchedCondition.actionId ).to.equal("purchase");

    }).timeout(10000);
  })
});

function generateInput( isAvailable, body ){
  return {
    isAvailable,
    body
  };
}
