import * as sinon from "sinon";
import {expect} from "chai"
import fs from "fs";

import {ConditionMap} from "@/core/ConditionMap";

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
          });
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
          });
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
          })).to.throw(Error);
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
          })).to.throw(Error);
      }).timeout(5000);
    });
    context("get - applicationId", function () {
      it("applicationIdがundefinedのときErrorがThrow", async () => {
        let jsonfile = fs.readFileSync("./test/fixtures/knowledge.json");
        expect(() => new ConditionMap(
          void(0),
          {
            source: "object",
            sourceOptions: {
              map: JSON.parse(jsonfile),
            },
            fetchForEachRequest: false,
          })).to.throw(Error);
      }).timeout(5000);
    });

  });

  context("fetchForEachRequestオプションがfalseのとき", function () {
    context("#get(mapがない状態)", function () {
      it("source.fetchの結果を返す", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: false,
          });
        ruleMap.map = null;
        const stubSource = {
          fetch: sinon.stub().onCall(0).returns({a: 1, b: "2"}),
        };
        ruleMap.source = stubSource;

        const map = await ruleMap.get();
        expect(map).to.deep.equal({a: 1, b: "2"});
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
          });
        ruleMap.map = {exist: true};

        const map = await ruleMap.get();
        expect(map).to.deep.equal({exist: true});
      });
    });
  });
  context("fetchForEachRequestオプションがtrueのとき", function () {
    context("#get(mapがない状態)", function () {
      it("source.fetchの結果を返す", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: true,
          });
        ruleMap.map = null;
        const stubSource = {
          fetch: sinon.stub().onCall(0).returns({a: 1, b: "2"}),
        };
        ruleMap.source = stubSource;

        const map = await ruleMap.get();
        expect(map).to.deep.equal({a: 1, b: "2"});
      });
    });
    context("#get(mapがある状態)", function () {
      it("source.fetchの結果を返す", async function () {
        const ruleMap = new ConditionMap(
          `dummyApplicationId100${new Date().getTime()}`,
          {
            source: "testLocal",
            sourceOptions: {},
            fetchForEachRequest: true,
          });
        ruleMap.map = {exist: true};
        const stubSource = {
          fetch: sinon.stub().onCall(0).returns({a: 1, b: "2"}),
        };
        ruleMap.source = stubSource;

        const map = await ruleMap.get();
        expect(map).to.deep.equal({a: 1, b: "2"});
      });
    });
  });
});
