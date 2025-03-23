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
  cs: 2,
  ml: 1,
});
describe("@snww获取中奖线路数", () => {
  it("@bwp和twp都有值的情况下", () => {
    const snww = slot.getSnww({
      bwp: {
        "10": [[0], [3], [5], [10], [14], [16, 17], [18, 19]],
      },
      twp: {
        "10": [1],
      },
      colLengths: [
        [0, 4],
        [5, 9],
        [10, 14],
        [15, 19],
        [20, 24],
        [25, 30],
      ],
    });
    expect(snww).toEqual({
      "10": 12,
    });
  });
});
describe("@非固定列长度的情况", () => {
  it("@黑帮风云数据", () => {
    const snww = slot.getSnww({
      bwp: {
        "6": [0, 2, 4, 8],
      },
      colLengths: slot.getColumnsRange({
        rl: [
          [6, 11, 6],
          [7, 6, 2],
          [8, 12, 0, 11],
          [2, 10, 2, 2],
          [7, 8, 11, 12],
          [8, 3, 4, 10],
        ],
      }),
    });
    expect(snww).toEqual({
      "6": 2,
    });
  });
});
