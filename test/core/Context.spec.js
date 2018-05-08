import { expect } from "chai";
import * as sinon from "sinon";
import { easyDeepCopy } from "@/utils/other_utils";

import * as config from "config";
import RedisPool from "@/utils/redisPool";
import Context from "@/core/Context";

const chai = require("chai");
const sinonChai = require("sinon-chai");
chai.use( sinonChai );


const extraSlotKeys = ["gender","period","event", "command"];
const LIFE_SPAN = 2;
const IGNORE_KEYS = ["slotKeys","extraSlotKeys", "initialLifeSpan"];

describe("Context", ()=>{
  const redisPool = RedisPool.getPool( config.redis );
  context("#@getOrInitial", ()=>{
    it("正常終了し、引数で渡されたuserIdを保持する", async ()=>{
      const context = await Context.getOrInitial("userId1", redisPool ,{ extraSlotKeys, initialLifeSpan: LIFE_SPAN });
      expect( context.userId ).to.equal("userId1");
    });
  });
  context("#update",()=>{
    it("渡された内容の contextSlots.merge を呼び出す", async ()=>{
      // 1st
      const context = await Context.getOrInitial("userId1", redisPool ,{ extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN });
      context.update({ 
        body: { 
          hoge:{ keyword:"hoge" },
          hoge2:{ keyword:"hoge2" },
        }
      });
      expect( context.body ).to.have.any.keys("hoge","hoge2");
    });
  });
  context("#persist,#@getOrInitial", ()=>{
    it("persistで現状の値を保持し、getOrInitialにて復元できる", async ()=>{
      // 1st
      const context = await Context.getOrInitial("userId2", redisPool ,{ extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN });
      context.update({
        body:{ 
          hoge:{ keyword:"hogehoge" },
          hoge2:{ keyword:"hoge2hoge2" },
        }
      });
      expect( context.body ).to.have.any.keys("hoge","hoge2");
      await context.persist();

      // 2nd
      const context2 = await Context.getOrInitial("userId2",  redisPool,{ extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN });
      expect( context2.body ).to.have.any.keys("hoge","hoge2");
      expect( context2.body.hoge.keyword ).to.equal("hogehoge");
      expect( context2.body.hoge2.keyword ).to.equal("hoge2hoge2");
    }).timeout(5000);
  });
  context("#forget", ()=>{
    it("ContextSlots#forgetを引数無しで呼び出す", async ()=>{
      
      const userId = `user${new Date().getTime()}`;
      const context = await Context.getOrInitial( userId, redisPool,{ extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN });

      const forget = sinon.stub();
      context.body.forget = forget;

      context.forget();
      expect( forget.getCall(0).args[0] ).to.equal( undefined );
    });
  });
  context("#setMatchedCondition", ()=>{
    it("ContextSlots#replaceByDefaultValueをconditionを引数に呼び出す", async ()=>{

      const userId = `user${new Date().getTime()}`;
      const context = await Context.getOrInitial( userId, redisPool ,{ holdUsedSlot: false, extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN });
      const spy = sinon.spy(context.body, "replaceByDefaultValue");

      const condition = { hoge: "*" };
      context.setMatchedCondition( condition );
      expect(spy).to.have.been.calledWith( condition );

    });
    context("#holdUsedSlotオプションが指定されていない場合", ()=>{
      it("ContextSlots#protectUsedKeysを呼び出さない", async ()=>{
        
        const userId = `user${new Date().getTime()}`;
        const context = await Context.getOrInitial( userId, redisPool ,{ holdUsedSlot: false, extraSlotKeys: ["hoge","hoge2"], initialLifeSpan: LIFE_SPAN });
        const spy = sinon.spy(context.body, "protectUsedKeys");

        const condition = { hoge: "*" };
        context.setMatchedCondition( condition );

        expect( spy.neverCalledWith( condition ) ).to.equal( true );
      });
    });
  });
});


