import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import {
  RL_WEIGHTS,
  TRL_WEIGHTS,
  FIXED_PRICE_ROUTES,
  ICON_MUL_MAP,
} from "../TetWeights";
import { UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
  userType: UserType.common,
  cs: 0.02,
  ml: 1,
});
describe("gml 倍率信息::蝶恋花", () => {
  describe("普通模式", () => {
    it("rswl 数据为 undefined", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [2, 4, 6, 10],
        isDuoBaoPending: false,
        baseGm: 5,
      });
      expect(gml).toEqual([1, 2, 3, 5]);
    });
    it("rswl 数据为 null", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [2, 4, 6, 10],
        isDuoBaoPending: false,
        rswl: null,
        baseGm: 5,
      });
      expect(gml).toEqual([1, 2, 3, 5]);
    });
    it("rswl 数据为 []", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [2, 4, 6, 10],
        isDuoBaoPending: false,
        rswl: [],
        baseGm: 5,
      });
      expect(gml).toEqual([1, 2, 3, 5]);
    });
    it("rswl 存在一条数据", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [2, 4, 6, 10],
        isDuoBaoPending: false,
        rswl: [[1, 4]],
        baseGm: 5,
      });
      expect(gml).toEqual([1, 2, 3, 10]);
    });
    it("rswl 存在三条数据", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [2, 4, 6, 10],
        isDuoBaoPending: false,
        rswl: [
          [1, 4],
          [1, 4],
          [1, 4],
        ],
        baseGm: 5,
      });
      expect(gml).toEqual([1, 2, 3, 20]);
    });
  });
  describe("夺宝模式", () => {
    it("rswl 数据为 undefined", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [3, 6, 9, 15],
        isDuoBaoPending: true,
        baseGm: 5,
      });
      expect(gml).toEqual([3, 6, 9, 15]);
    });
    it("rswl 数据为 null", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [3, 6, 9, 15],
        isDuoBaoPending: true,
        rswl: null,
        baseGm: 5,
      });
      expect(gml).toEqual([3, 6, 9, 15]);
    });
    it("rswl 数据为 []", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [3, 6, 9, 15],
        isDuoBaoPending: true,
        rswl: [],
        baseGm: 5,
      });
      expect(gml).toEqual([3, 6, 9, 15]);
    });
    it("rswl 存在一条数据", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [3, 6, 9, 15],
        isDuoBaoPending: true,
        rswl: [[1, 4]],
        baseGm: 5,
      });
      expect(gml).toEqual([3, 6, 9, 20]);
    });
    it("rswl 存在三条数据", () => {
      const gml = slot.getGml({
        baseList: [1, 2, 3, 5],
        highList: [3, 6, 9, 15],
        isDuoBaoPending: true,
        rswl: [
          [1, 4],
          [1, 4],
          [1, 4],
        ],
        baseGm: 5,
      });
      expect(gml).toEqual([3, 6, 9, 30]);
    });
  });
  describe("上一局中奖", () => {
    it("rswl 存在三条数据", () => {
      const slot = new BaseSlot({
        rlWeights: RL_WEIGHTS,
        trlWeights: TRL_WEIGHTS,
        userType: UserType.common,
        cs: 0.02,
        ml: 1,
        prevSi: {
          wp: { 1: [] },
        },
      });
      expect(
        slot.getGml({
          baseList: [1, 2, 3, 5],
          highList: [3, 6, 9, 15],
          prevGml: slot.isPreWin ? [1, 2, 3, 10] : null,
          isDuoBaoPending: false,
          rswl: [[1, 4]],
          baseGm: 5,
        })
      ).toEqual([1, 2, 3, 15]);
    });
  });
  describe("上一局未中奖", () => {
    it("rswl 存在三条数据", () => {
      const slot = new BaseSlot({
        rlWeights: RL_WEIGHTS,
        trlWeights: TRL_WEIGHTS,
        userType: UserType.common,
        cs: 0.02,
        ml: 1,
      });
      expect(
        slot.getGml({
          baseList: [1, 2, 3, 5],
          highList: [3, 6, 9, 15],
          prevGml: slot.isPreWin ? [1, 2, 3, 10] : null,
          isDuoBaoPending: false,
          rswl: [[1, 4]],
          baseGm: 5,
        })
      ).toEqual([1, 2, 3, 10]);
    });
  });
});
