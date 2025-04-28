import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import {
  RL_WEIGHTS,
  TRL_WEIGHTS,
  FIXED_PRICE_ROUTES,
  ICON_MUL_MAP,
} from "../TetWeights";
import { UserType } from "utils/helper";
import { chunk, flatMapDeep, flattenDeep, keys, values } from "lodash";

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
        prevRl: flattenDeep([
          [5, 2, 11],
          [3, 7, 2],
          [8, 12, 0, 11],
          [0, 2, 10, 2],
          [7, 8, 11, 12],
          [8, 3, 4, 10],
        ]),
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
    expect(
      slot.getRnsp({
        prevRl: flattenDeep([
          [11, 8, 11],
          [6, 8, 11],
          [9, 4, 0, 9],
          [0, 6, 9, 11],
          [6, 3, 10, 0],
          [8, 9, 10, 11],
        ]),
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[10, 3], [8], [], [3], [], [10]],
      })
    ).toEqual([[1, 0], [3], [], [11], [], [18]]);
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
  it("报错数据:", () => {
    // 某一列开头连续2个百搭
    expect(
      slot.getRnsp({
        prevRl: flattenDeep([
          10, 12, 11, 2, 11, 10, 11, 12, 10, 4, 0, 0, 10, 6, 7, 5, 11, 11, 12,
          12, 8, 12,
        ]),
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[9, 7], [10, 12], [11, 12], [12], [], []],
      })
    ).toEqual([[1, 0], [4, 3], [7, 6], [12], [], []]);
    // 某一列开头连续3个百搭
    expect(
      slot.getRnsp({
        prevRl: flattenDeep([
          10, 12, 11, 2, 11, 10, 11, 12, 10, 4, 0, 0, 0, 6, 7, 5, 11, 11, 12,
          12, 8, 12,
        ]),
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[9, 7], [10, 12], [11, 12], [12], [], []],
      })
    ).toEqual([[1, 0], [4, 3], [7, 6], [13], [], []]);
    // 某一列开头一个百搭，中间一个百搭
    expect(
      slot.getRnsp({
        prevRl: flattenDeep([
          10, 12, 11, 2, 11, 10, 11, 12, 10, 4, 0, 3, 0, 6, 7, 5, 11, 11, 12,
          12, 8, 12,
        ]),
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        rns: [[9, 7], [10, 12], [11, 12], [12, 8], [], []],
      })
    ).toEqual([[1, 0], [4, 3], [7, 6], [13, 11], [], []]);
  });
});
