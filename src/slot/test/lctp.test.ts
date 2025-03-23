import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber } from "lodash";

describe("@招财猫LCTP问题定位", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,
    userType: UserType.common,
    cs: 0,
    ml: 0,
    prevSi: { wp: { 1: 1 } },
  });
  it("@trl发生掉落", () => {
    expect(
      slot.getLctp({
        trl: [],
        trns: [2, 2],
      })
    ).toEqual([2, 3]);
  });
});
