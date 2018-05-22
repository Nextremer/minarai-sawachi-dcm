import * as sinon from "sinon";
import {expect} from "chai"
import fs from "fs";


import {ConditionMap} from "@/core/ConditionMap";
import * as config from "config";

describe("ConditionMap", function () {
  beforeEach(() => {
    ConditionMap.instance = null;
  });

  context("source=json", function () {
    context("get", function () {
      it("直接JSONでデータを流し込む", async () => {
        let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "json",
            sourceOptions: {
              map: jsonfile,
            },
            fetchForEachRequest: false,
          },
          config.redis);
        const map = await ruleMap.get();
        expect(map[0]).to.have.a.property("Ex");

      }).timeout(5000);
    });
  });

  context("source=object", function () {
    context("get", function () {
      it("直接Objectでデータを流し込む", async () => {
        let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "object",
            sourceOptions: {
              map: JSON.parse(jsonfile),
            },
            fetchForEachRequest: false,
          },
          config.redis);
        const map = await ruleMap.get();
        expect(map[0]).to.have.a.property("Ex");

      }).timeout(5000);
    });

    context("get - applicationId", function () {
      it("applicationIdがnullのときErrorがThrow", async () => {
        let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
        expect(() => new ConditionMap(
          null,
          {
            source: "object",
            sourceOptions: {
              map: JSON.parse(jsonfile),
            },
            fetchForEachRequest: false,
          },
          config.redis)).to.throw(Error);
      }).timeout(5000);
    });
    context("get - applicationId", function () {
      it("applicationIdが空のときErrorがThrow", async () => {
        let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
        expect(() => new ConditionMap(
          "",
          {
            source: "object",
            sourceOptions: {
              map: JSON.parse(jsonfile),
            },
            fetchForEachRequest: false,
          },
          config.redis)).to.throw(Error);
      }).timeout(5000);
    });
    context("get - applicationId", function () {
      it("applicationIdがundefinedのときErrorがThrow", async () => {
        let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
        expect(() => new ConditionMap(
          undefined,
          {
            source: "object",
            sourceOptions: {
              map: JSON.parse(jsonfile),
            },
            fetchForEachRequest: false,
          },
          config.redis)).to.throw(Error);
      }).timeout(5000);
    });

  });

  context("source=redis", function () {

    it("Redisから存在しないデータを読んで、ErrorがThrowされる", async () => {
      const ruleMap = new ConditionMap(
        `dummyApplicationId100${new Date().getTime()}`,
        {
          source: "redis",
          sourceOptions: false,
          fetchForEachRequest: false,
        },
        config.redis);

      try {
        const map = await ruleMap.get();
        expect.fail("ここはこないはず");
      } catch (e) {
        expect(e).instanceof(Error)
      }
    }).timeout(5000);

    it("Redisにデータの存在を確認したとき、存在しないときはFalseが返ってくる", async () => {
      const ruleMap = new ConditionMap(
        `dummyApplicationId100${new Date().getTime()}`,
        {
          source: "redis",
          sourceOptions: false,
          fetchForEachRequest: false,
        },
        config.redis);
      const result = await ruleMap.mapExists();
      expect(result).to.be.false;
    }).timeout(3000);

    it("Redisにデータの存在を確認したとき、存在するときはTrueが返ってくる", async () => {
      // 準備
      const appId = `dummyApplicationId100${new Date().getTime()}`;
      const map = [{topic: "dummy", target: "-", actionId: "dummy"}];
      const dummyRuleMap = new ConditionMap(
        appId,
        {
          source: "object",
          sourceOptions: {
            map: map
          },
          fetchForEachRequest: false,
        },
        config.redis);
      ////

      const ruleMap = new ConditionMap(
        appId,
        {
          source: "redis",
          sourceOptions: false,
          fetchForEachRequest: false,
        },
        config.redis);
      const result = await ruleMap.mapExists();
      expect(result).to.be.true;
    }).timeout(3000);

  });

  context("fetchForEachRequestオプションがfalseのとき", function () {
    context("#get(mapがない状態)", function () {
      it("source.fetchの結果からmapとextraSlotKeysをとりだす", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: false,
          },
          config.redis);
        ruleMap.map = null;
        const stubSource = {
          fetch: sinon.stub().resolves({conditionMap: [{a: 1, b: "2"}], extraSlotKeys: ["one", "two", "three"]}),
        };
        ruleMap.source = stubSource;

        const map = await ruleMap.get();
        expect(map).to.deep.equal([{a: 1, b: "2"}]);
        const extraSlotKeys = await ruleMap.getExtraSlotKeys();
        expect(extraSlotKeys).to.deep.equal(["one", "two", "three"]);
      });
    });
    context("#get(mapがある状態)", function () {
      it("mapをそのまま返す", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: false,
          },
          config.redis);
        ruleMap.map = {conditionMap: {exist: true}, extraSlotKeys: []};

        const map = await ruleMap.get();
        expect(map).to.deep.equal({exist: true});
      });
    });
  });
  context("fetchForEachRequestオプションがtrueのとき", function () {
    context("#get(mapがない状態)", function () {
      it("source.fetchの結果からmapとextraSlotKeysをとりだす", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: true,
          },
          config.redis);
        ruleMap.map = null;
        const stubSource = {
          fetch: sinon.stub().resolves({conditionMap: [{a: 1, b: "2"}], extraSlotKeys: ["one", "two", "three"]}),
        };
        ruleMap.source = stubSource;

        const map = await ruleMap.get();
        expect(map).to.deep.equal([{a: 1, b: "2"}]);
        const extraSlotKeys = await ruleMap.getExtraSlotKeys();
        expect(extraSlotKeys).to.deep.equal(["one", "two", "three"]);
      });
    });
    context("#get(mapがある状態)", function () {
      it("source.fetchの結果からmapとextraSlotKeysをとりだす", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId101${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: true,
          },
          config.redis);
        ruleMap.map = {conditionMap: {exist: true}, extraSlotKeys: []};

        const stubSource = {
          fetch: sinon.stub().resolves({conditionMap: [{a: 1, b: "2"}], extraSlotKeys: ["one", "two", "three"]}),
        };
        ruleMap.source = stubSource;

        const map = await ruleMap.get();
        expect(map).to.deep.equal([{a: 1, b: "2"}]);
      });
    });
  });

  context("extraSlotKeysの扱いについて", function () {
    const appId = `dummyApplicationId101${new Date().getTime()}`;
    const optionsBase = {
      source: "object",
      sourceOptions: {
        map: [{topic: "Topic", target: "Target", one: "One", two: "Two", three: "Three", actionId: "ActionID"}]
      },
      fetchForEachRequest: true,
      redis: config.redis,
    };
    const optionsRedis = {
      source: "redis",
      sourceOptions: false,
      fetchForEachRequest: false,
    };

    it("extraSlotKeysがRedisに保存され、それを読み出せること", async function () {
      optionsBase.extraSlotKeys = ["one", "two", "three"];
      const ruleMap_save = new ConditionMap(appId, optionsBase, config.redis);
      const ruleMap_load = new ConditionMap(appId, optionsRedis, config.redis);
      const extraSlotKeys = await ruleMap_load.getExtraSlotKeys();
      expect(extraSlotKeys).deep.equal(["one", "two", "three"]);
    });

    it("Redisに保存されたextraSlotKeysをOverrideできること", async function () {
      optionsRedis.extraSlotKeys = ["three", "one"];
      const ruleMap_load_1 = new ConditionMap(appId, optionsRedis, config.redis);
      const extraSlotKeys_1 = await ruleMap_load_1.getExtraSlotKeys();
      expect(extraSlotKeys_1).deep.equal(["three", "one"]);
      delete optionsRedis.extraSlotKeys;
    });

    it("OverrideしたextraSlotKeysがRedisに保存されていること", async function () {
      const ruleMap_load_1 = new ConditionMap(appId, optionsRedis, config.redis);
      const extraSlotKeys_1 = await ruleMap_load_1.getExtraSlotKeys();
      expect(extraSlotKeys_1).deep.equal(["three", "one"]);
    });
  });
});
