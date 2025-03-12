import { expect, describe, it, test } from "bun:test";
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
describe("@通用逻辑:查找当前图标的数量", () => {
  describe("@存在合并情况", () => {
    it("多组合并情况", () => {
      expect(
        slot.getIconCount({
          iconPos: [3, 20, 21, 22, 23, 24],
          esb: {
            "1": [5, 6],
            "2": [7, 8],
            "3": [10, 11],
            "4": [15, 16],
            "5": [18, 19],
            "6": [20, 21, 22],
            "7": [23, 24],
          },
        })
      ).toEqual(3);
    });
    it("单组合并情况", () => {
      expect(
        slot.getIconCount({
          iconPos: [3, 20, 21, 22, 23, 24],
          esb: {
            "1": [5, 6],
            "2": [7, 8],
            "3": [10, 11],
            "4": [15, 16],
            "5": [18, 19],
            "6": [20, 21, 22],
            // "7": [23, 24],
          },
        })
      ).toEqual(4);
    });
    it("无效合并信息", () => {
      expect(
        slot.getIconCount({
          iconPos: [3, 20, 21, 22, 23, 24],
          esb: {
            "1": [5, 6],
            "2": [7, 8],
            "3": [10, 11],
            "4": [15, 16],
            "5": [18, 19],
            // "6": [20, 21, 22],
            // "7": [23, 24],
          },
        })
      ).toEqual(6);
    });
    it("边界情况 - 合并组末尾位置匹配", () => {
      expect(
        slot.getIconCount({
          iconPos: [3, 22, 24],
          esb: {
            "1": [5, 6],
            "2": [7, 8],
            "3": [10, 11],
            "4": [15, 16],
            "5": [18, 19],
            "6": [20, 21, 22],
            "7": [23, 24],
          },
        })
      ).toEqual(3);
    });
  });
  it("@不存在合并情况", () => {
    expect(
      slot.getIconCount({
        iconPos: [3, 20, 21, 22, 23, 24],
      })
    ).toEqual(6);
  });
  it("@空输入处理", () => {
    expect(slot.getIconCount({ iconPos: [] })).toEqual(0);
    expect(
      slot.getIconCount({
        iconPos: [],
        esb: {
          "1": [5, 6],
          "2": [7, 8],
          "3": [10, 11],
          "4": [15, 16],
          "5": [18, 19],
          "6": [20, 21, 22],
          "7": [23, 24],
        },
      })
    ).toEqual(0);
  });
});
