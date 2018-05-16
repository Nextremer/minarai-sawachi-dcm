
const DialogueContextManager = require( "dialogue-context-manager" ).default;
const conditionMap = [{
  topic: "profile",
  target: "something",
  slot1: "foo",
  slot2: "-",
  slot3: "-",
  actionId: "someaction"
}];
const options = {
  conditionMap: {
    source: "object",
    sourceOptions: {
      map: conditionMap,
    },
    fetchForEachRequest: false,
  },
  redis: {
    connectionString: "redis://HOST:PORT"
  },
  extraSlotKeys: ["slot1", "slot2", "slot3" ],
  initialLifeSpan: 2,
  holdUsedSlot: true,
  verbose: true,
};


function main() {
  const contextManager = new DialogueContextManager(options);
  contextManager.getNewContext("testuser", {isAvailable: true, body: {slot1: {keyword: "foo"}}})
    .then((context) => {

      console.log( context.matchedCondition );
      console.log( context.body );
      console.log( context.extra );

      context.extra.hoge = "1";
      context.persist();

    }).catch(( error )=>{
      console.log ( error );
    });

};

main();
