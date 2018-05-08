
# Dialogue Context Manager

複数回の対話エンジンの応答内容をslotに格納、記憶した上で、
定義したルールと各種slot状態に応じたActionIdを取得する。
(ActionId = 応答内容を生成するための処理等を識別するためのID)

名前気に入っていないので激しく募集中。
We really don't like this name. Pull request that changes the name of library, is strongly wanted.


# Requirements

* redis ( "redis://" で接続できるようになっていること )
  * contextの保存に利用しています

# Get Started 

## install

* Githubアカウントとssh_keyを紐付けている場合は下記でインストールが可能です

```
npm install Nextremer/minarai-sawachi-dcm --save
```

* heroku等、npm installする安協のsshキーとユーザを紐付けにくい場合は、`package.json`に useridと tokenを記述します。
  * operation用のユーザ `minarai-ops` 等のアクセストークンを用いると良いと思います。

```json
{
  dependencies: {
    "minarai": "git+https://${user name of github}:${ access token of user }@github.com/Nextremer/minarai-sawachi-dcm.git#"
  }
}
```

その上で、 `npm install` でインストールできます。



## Example 

リファレンスについては次の項を参照。
Babel,ES5環境におけるコードサンプルを以下に提示します。

###  with babel 

```js
import DialogueContextManager from "dialogue-context-manager";

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
    connectionString: "redis://HOST:PORT" // CHANGE ME!
  },
  extraSlotKeys: ["slot1", "slot2", "slot3" ],
  initialLifeSpan: 2,
  holdUsedSlot: true,
  forceReCreateMap: false,
  verbose: true,
};

async function main(){
  const contextManager = DialogueContextManager.getInstance( options );
  const input = {
    isAvailable: true,
    body: {
      slot1: { keyword: "foo" }
    }
  };
  const context = await contextManager.getNewContext( "testUserId", input );

  console.log( context.matchedCondition );  // matchedCondition.actionId 
  console.log( context.body ); // you can access

  // you can also set any key and value you want under context.extra. 
  console.log( context.extra ); 
  context.extra.hoge = "1"; 

  // to persist context manually, call #persist method
  await context.persist();
};

main();
```

### ES5

```js
var DialogueContextManager = require( "dialogue-context-manager" ).default;

var conditionMap = [{
  topic: "profile",
  target: "something",
  slot1: "foo",
  slot2: "-",
  slot3: "-",
  actionId: "someaction"
}];

var options = {
  conditionMap: {
    source: "object",
    sourceOptions: {
      map: conditionMap,
    },
    fetchForEachRequest: false,
  },
  redis: {
    connectionString: "redis://HOST:PORT" // CHANGE ME!
  },
  extraSlotKeys: ["slot1", "slot2", "slot3" ],
  initialLifeSpan: 2,
  holdUsedSlot: true,
  forceReCreateMap: false,
  verbose: true,
};

function main(){
  var contextManager = DialogueContextManager.getInstance( options );
  var input = {
    isAvailable: true,
    body: {
      slot1: { keyword: "foo" }
    }
  };
  contextManager.getNewContext( "testUserId", input } )
    .then( ( context )=>{

      console.log( context.matchedCondition );  // matchedCondition.actionId 
      console.log( context.body ); // you can access

      // you can also set any key and value you want under context.extra. 
      console.log( context.extra ); 
      context.extra.hoge = "1"; 

      // to persist context manually, call #persist method
      context.persist();

    }).catch(( error )=>{
      console.log ( error );
    });

};

main();
```



## Usage / Specifications

**E2E test code** : https://github.com/Nextremer/minarai-sawachi-dcm/blob/master/test/e2e/e2e.spec.js.

```js

// getting DialogueContextManagerInstance ( singleton )
const contextManager = DialogueContextManager.getInstance( options );

// getting new context
//   see input interface
const input = {
  isAvailable: true,
  body: {
    slot1: { keyword: "foo" }
  }
};

// getting new context
//  see context interface
const context = await contextManager.getNewContext( "testUserId", input );

```

#### input interface

**基本構造**

```js
const input = {
  isAvailable: true, // or false ;; 対話エンジンからの応答を採用したい（デフォルト出ない場合にtrue）
  body: { // 対話エンジンから抽出した結果
    /* 後述 */
    topic: {
      id: "topicId",
    },
    target: {
      type: "country",
      keyword: "Japan",
    },
    extraSlotKeys1: {
      keyword: "extraSlotKey1Value",
    },
  },
```

**body** 

* **topic**
  * EX : `{ id: "topicid" }`
    * **id**
      * 必須
      * 話題のid( 対話エンジンの応答 )
* target
  * EX: `{ type: "target type", keyword: "keyword" }`
    * **type**
      * 必須
      * targetの種別 ( 決めの問題だが、スポーツbotの場合は player , country 等 )
  * **keyword** 
    * 必須
    * 対話エンジンの応答結果
* **extraSlotKeys で定義されているキー** ( ex: testKey )
  * EX : ` {  testKey: {  keyword : "textKeyWord" } }`
  * **keyword** 
    * 必須
    * 対話エンジンの応答結果


#### context interface

```js
const context = await contextManager.getNewContext( "testUserId", input );

// コンテキストの中身を確認
console.log( context.body ); // => { topic: {}, target: {}, extraSlotKeys1: {}, extraSlotKeys2: {} }
// マッチしたactionIdを確認
console.log( context.matchedCondition ); // => { actionId: "", topic: "", target: "", extraSlotKeys1: "-", extraSlotKeys2: "*" }

```


# Development

* **Test**
  * `npm run test` or `npm run watch:test`
* **lint**
  * `npm run lint`
* **build**
  * `npm run build`

