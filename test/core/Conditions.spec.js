
import { expect } from "chai";
import * as sinon from "sinon";
import { easyDeepCopy } from "@/utils/other_utils";

import Conditions from "@/core/Conditions";
import { MAP, createContext, contextBodyFromArray } from "./helpers/ActionFactorySpecConstants"; 
import { TEST_CASES } from "./helpers/ActionFactorySpecInputData"; 

describe("Condition", ()=>{
  const conditionMap = MAP();
  context("#getMatchedCondition", ()=>{
    TEST_CASES.forEach((testCase)=>{
      context( testCase.contextText, ()=>{
        it( testCase.itText , ()=>{
          const consensus = contextBodyFromArray( testCase.consensus );
          const contextBody = contextBodyFromArray( testCase.contextBody );
          const inputContext = createContext( consensus, contextBody );

          const conditions = new Conditions( conditionMap, ["gender","event","period"],inputContext );

          expect( conditions.getMatchedCondition().actionId ).to.equal( testCase.expected );
        });
      });

    })
  });
});
