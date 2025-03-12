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
describe("@通用逻辑:查找当前图标的位置信息", () => {
  describe("@不存在跳过行的操作", () => {
    test("存在目标元素且为二维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            [1, 11, 9, 2, 7],
            [12, 12, 9, 9, 10],
            [11, 11, 9, 5, 7],
            [12, 12, 8, 1, 1],
            [2, 2, 2, 2, 2],
            [5, 5, 10, 6, 12],
          ],
          targetIconId: 2,
        })
      ).toEqual([3, 20, 21, 22, 23, 24]);
    });
    it("不存在目标元素且为二维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            [1, 11, 9, 2, 7],
            [12, 12, 9, 9, 10],
            [11, 11, 9, 5, 7],
            [12, 12, 8, 1, 1],
            [2, 2, 2, 2, 2],
            [5, 5, 10, 6, 12],
          ],
          targetIconId: 0,
        })
      ).toEqual([]);
    });
    test("存在目标元素且为一维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            1, 11, 9, 2, 7, 12, 12, 9, 9, 10, 11, 11, 9, 5, 7, 12, 12, 8, 1, 1,
            2, 2, 2, 2, 2, 5, 5, 10, 6, 12,
          ],
          targetIconId: 2,
        })
      ).toEqual([3, 20, 21, 22, 23, 24]);
    });
    it("不存在目标元素且为二维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            1, 11, 9, 2, 7, 12, 12, 9, 9, 10, 11, 11, 9, 5, 7, 12, 12, 8, 1, 1,
            2, 2, 2, 2, 2, 5, 5, 10, 6, 12,
          ],
          targetIconId: 0,
        })
      ).toEqual([]);
    });
    it("空列表处理", () => {
      expect(
        slot.findIconPos({
          rondomList: [],
          targetIconId: 0,
        })
      ).toEqual([]);
    });
  });
  describe("@存在跳过行的操作", () => {
    test("存在目标元素且为二维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            [1, 11, 9, 2, 7],
            [12, 12, 9, 9, 10],
            [11, 11, 9, 5, 7],
            [12, 12, 8, 1, 1],
            [2, 2, 2, 2, 2],
            [5, 5, 10, 6, 12],
          ],
          skipRow: 1,
          targetIconId: 2,
        })
      ).toEqual([3, 21, 22, 23, 24]);
    });
    it("不存在目标元素且为二维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            [1, 11, 9, 2, 7],
            [12, 12, 9, 9, 10],
            [11, 11, 9, 5, 7],
            [12, 12, 8, 1, 1],
            [2, 2, 2, 2, 2],
            [5, 5, 10, 6, 12],
          ],
          skipRow: 1,
          targetIconId: 0,
        })
      ).toEqual([]);
    });
    test("存在目标元素且为一维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            2, 11, 9, 2, 7, 12, 12, 9, 9, 10, 11, 11, 9, 5, 7, 12, 12, 8, 1, 1,
            2, 2, 2, 2, 2, 5, 5, 10, 6, 12,
          ],
          skipRow: 1,
          targetIconId: 2,
        })
      ).toEqual([3, 20, 21, 22, 23, 24]);
    });
    it("不存在目标元素且为二维数组", () => {
      expect(
        slot.findIconPos({
          rondomList: [
            1, 11, 9, 2, 7, 12, 12, 9, 9, 10, 11, 11, 9, 5, 7, 12, 12, 8, 1, 1,
            2, 2, 2, 2, 2, 5, 5, 10, 6, 12,
          ],
          skipRow: 1,
          targetIconId: 0,
        })
      ).toEqual([]);
    });
    it("空列表处理", () => {
      expect(
        slot.findIconPos({
          rondomList: [],
          skipRow: 1,
          targetIconId: 0,
        })
      ).toEqual([]);
    });
  });
});
