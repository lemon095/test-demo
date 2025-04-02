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
describe("rnsp掉落图标的位置信息", () => {
  it("存在掉落", () => {
    expect(
      slot.getRnsp({
        prevRl: [
          5, 2, 11, 3, 7, 2, 8, 12, 0, 11, 2, 10, 0, 2, 7, 8, 11, 12, 8, 3, 4,
          10,
        ],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[2, 5], [3], [], [], [], []],
      })
    ).toEqual([[1, 0], [3], [], [], [], []]);
    expect(
      slot.getRnsp({
        prevRl: [
          5, 2, 11, 3, 7, 2, 8, 12, 0, 11, 2, 10, 0, 2, 7, 8, 11, 12, 8, 3, 4,
          10,
        ],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[10], [4], [], [8, 10], [], []],
      })
    ).toEqual([[0], [3], [], [11, 10], [], []]);
  });
  it("掉落的图标在百搭之后", () => {
    expect(
      slot.getRnsp({
        prevRl: [
          5, 2, 11, 3, 7, 2, 8, 12, 0, 11, 0, 2, 10, 2, 7, 8, 11, 12, 8, 3, 4,
          10,
        ],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[10], [4], [], [8, 10], [], []],
      })
    ).toEqual([[0], [3], [], [12, 11], [], []]);
  });
  it("不存在掉落", () => {
    expect(
      slot.getRnsp({
        prevRl: [],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
      })
    ).toBeNull();
  });
});
