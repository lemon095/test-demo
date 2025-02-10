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

describe("lw 基础中奖金额", () => {
  it("不存在 rwsp 信息时", () => {
    const slot = new BaseSlot({
      rlWeights: RL_WEIGHTS,
      trlWeights: TRL_WEIGHTS,
      userType: UserType.common,
      cs: 0.02,
      ml: 1,
    });
    expect(slot.getLw({})).toBeNull();
  });
  it("只有 rwsp 信息，不存在 snww", () => {
    const slot = new BaseSlot({
      rlWeights: RL_WEIGHTS,
      trlWeights: TRL_WEIGHTS,
      userType: UserType.common,
      cs: 1,
      ml: 5,
    });
    expect(
      slot.getLw({
        rwsp: {
          "6": 10,
          "18": 10,
        },
      })
    ).toEqual({
      "6": 50,
      "18": 50,
    });
  });
  it("存在 rwsp 信息和 snww信息", () => {
    const slot = new BaseSlot({
      rlWeights: RL_WEIGHTS,
      trlWeights: TRL_WEIGHTS,
      userType: UserType.common,
      cs: 0.02,
      ml: 1,
    });
    expect(
      slot.getLw({
        rwsp: {
          "4": 25,
        },
        snww: {
          "4": 1,
        },
      })
    ).toEqual({
      4: 0.5,
    });
  });
});
