
import RedisPool from "@/utils/redisPool";
import Conditions from "./Conditions";
import Context from "./Context";
import { ConditionMap } from "./ConditionMap";

export default class DialogueContextManager{

  static instance;
  static getInstance( options /* see constructor */ ){
    const { forceReCreateMap } = options;
    if( !DialogueContextManager.instance || forceReCreateMap ){
      DialogueContextManager.instance = new DialogueContextManager( options );
    }
    return DialogueContextManager.instance;
  }

  constructor( options ){
    const { 
      conditionMap, 
      redis, 
      extraSlotKeys, 
      initialLifeSpan, 
      holdUsedSlot,
      forceReCreateMap,
      verbose,
    } = options;

    this.redisPool = RedisPool.getPool( redis );
    this.ruleMap = ConditionMap.getInstance( conditionMap, forceReCreateMap );

    this.extraSlotKeys = extraSlotKeys;
    this.holdUsedSlot = holdUsedSlot;
    this.initialLifeSpan = initialLifeSpan;
    this.verbose = verbose;
  }

  vLog( text ){
    if( !this.verbose ){ return; }
    console.log( text );
  }

  async getNewContext( userId, newInput ){
    this.vLog("DialogueContextManager#getNewContext called");
    try{

      const errors = this.validateInput( (newInput || {}).body );
      if( errors.length > 0 ){
        console.error( errors.join("\n") );
        throw new Error("DialogueContextManager#getNewContext invalid input");
      }
      this.vLog("input validation done");

      // contextをredisから取得
      const context = await Context.getOrInitial( 
        userId, 
        this.redisPool,
        {
          initialLifeSpan: this.initialLifeSpan,
          extraSlotKeys: this.extraSlotKeys,
          holdUsedSlot: this.holdUsedSlot,
        }
      );
      this.vLog("get context done");

      // contextをupdateする
      await context.update( newInput );
      context.forget();
      this.vLog("update context done");

      // contextからconditionゲット
      const ruleMap = await this.ruleMap.get();
      const matchedCondition = new Conditions( ruleMap, this.extraSlotKeys, context ).getMatchedCondition();
      context.setMatchedCondition( matchedCondition );
      this.vLog("pickup condition done");

      // contextを永続化
      await context.persist();
      this.vLog("persist context done");

      // contextを返却
      return context;
    }catch(e){
      console.error("Error on DialogueContextManager#getNewContext");
      console.error(e);
      throw new Error(e);
    }
  }

  resetMap(){
    this.ruleMap.clear();
  }

  validateInput( inputBody ){
    const errors = [];
    if( !inputBody ){
      return [ "input.body must be an Object" ]; 
    }
    Object.keys( inputBody ).forEach( (key) => {
      if( this.extraSlotKeys.includes( key ) && !isDefinedText( inputBody[key].keyword ) ){
        errors.push(` input value "${key}" is expected to have property "keyword", but actual is "${JSON.stringify( inputBody[key] )}"`);
      }
      if( key === "topic" && !isDefinedText( inputBody[key].id ) ){
        errors.push(` input value "topic" is expected to have property "id", but actual is "${JSON.stringify( inputBody[key] )}"`);
      }
      if( key === "target" && ( !isDefinedText( inputBody[key].type ) || !isDefinedText( inputBody[key].keyword ) ) ){
        errors.push(` input value "target" is expected to have property "type" and "keyword", but actual is "${JSON.stringify( inputBody[key] )}"`);
      }
    });
    return errors;
  }
}

function isDefinedText( text ){
  if( text ){ return true; }
  if( text === "" ){ return true; }
  return false;
}
