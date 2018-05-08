

import { deleteUndefined  } from "@/utils/other_utils";
import { MAP_DATA } from "./ActionFactorySpecMapData";

export function createContext( latestInputOptions , contextBodyOptions ){

  return {
    body:  bodyObject( contextBodyOptions ),
    latestInput: { 
      isAvailable: true,
      body: bodyObject( latestInputOptions ),
    },
  };
}

export function bodyObject(options){
  return deleteUndefined({
    resetTopic: function(){ },
    topic: { id: options.topic },
    target: (!options.target)? undefined : {
      type: options.target,
    },
    gender: (!options.gender)? undefined : {
      keyword: options.gender,
    },
    event: (!options.event)? undefined : {
      keyword: options.event,
    },
    period: (!options.period)? undefined : {
      keyword: options.period,
    },
  });
}

//export function SAMPLE_INPUT(){ 
//  return {
//    "clientId": "test1500554715663",
//    "body": {
//      "target": {
//        "type": "player",
//        "values": [
//          {
//            "keyword": "ボルト",
//            "db": [
//              {
//                "name": "ウサイン・ボルト",
//                "code": "1"
//              }
//            ]
//          }
//        ],
//        "lifeSpanCounter": 2
//      },
//      "topic": {
//        "id": "record",
//        "utteranceValue": "の記録ですね。こちらをご覧ください。",
//        "lifeSpanCounter": 2
//      },
//      "event": {
//        "keyword": "100m",
//        "lifeSpanCounter": 2
//      },
//      "gender": {
//        "keyword": "men",
//        "lifeSpanCounter": 2
//      }
//    },
//    "latestInput": {
//      "body": {
//        "target": {
//          "type": "player",
//          "values": [
//            {
//              "keyword": "ボルト"
//            }
//          ]
//        },
//        "topic": {
//          "id": "record",
//          "utteranceValue": "の記録ですね。こちらをご覧ください。"
//        },
//        "gender": {
//          "keyword": "men"
//        },
//        "event": {
//          "keyword": "100m"
//        }
//      },
//      "isAvailable": true
//    },
//    "latestRequest": {
//      "id": "test1500554715663-1500554730987",
//      "head": {
//        "clientId": "test1500554715663",
//        "timestampUnixTime": 1500554730987,
//        "lang": "ja"
//      },
//      "body": {
//        "message": "ボルトの100m走の男子の記録"
//      }
//    }
//  };
//}



export function MAP(){
  return MAP_DATA.map((row)=>{
    return {
      topic: row[0],
      target: row[1],
      gender: row[2],
      event: row[3],
      period: row[4],
      actionId: row[5],
    }
  });
}


export function contextBodyFromArray( testCaseArray ){
  return  {
      topic: testCaseArray[0],
      target: testCaseArray[1],
      gender: testCaseArray[2],
      event: testCaseArray[3],
      period: testCaseArray[4],
  };
}
