import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber } from "lodash";

describe("墨西哥: 上一次中奖的情况下gsp金框位置信息", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,
    userType: UserType.common,
    cs: 0,
    ml: 0,
    prevSi: { wp: { 1: 1 } },
  });
  it("gsp 未发生掉落、未发生位置移动", () => {
    expect(
      slot.getGsp({
        rl: [],
        preGsp: [5, 6, 7],
        cgsp: null,
        ngsp: null,
        rate: [],
        preRl: [6, 10, 9, 9, 4, 9, 8, 8, 6, 9, 3, 7, 9, 6, 8, 10, 9, 7, 7, 8],
      })
    ).toEqual([5, 6, 7]);
  });
  it("gsp 未发生掉落、未发生位置移动，且上一次金框变百搭", () => {
    expect(
      slot.getGsp({
        rl: [],
        preGsp: [5, 6, 7],
        cgsp: null,
        ngsp: null,
        rate: [],
        preRl: [5, 6, 10, 9, 4, 0, 8, 8, 7, 6, 3, 7, 9, 6, 8, 10, 9, 7, 7, 8],
      })
    ).toEqual([6, 7]);
  });
});
describe("黑帮: 存在ngsp", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,
    userType: UserType.common,
    cs: 0,
    ml: 0,
    prevSi: { wp: { 1: 1 } },
  });
  expect(
    slot.getGspBy1580541({
      rl: [],
      weights: {} as any,
      prevGsp: [6, 8, 10, 11, 17, 18, 19],
      cgsp: [
        [11, 12],
        [18, 19],
        [19, 20],
      ],
      ngsp: [18],
      prevRl: [
        11, 8, 11, 6, 8, 11, 9, 4, 0, 9, 0, 6, 9, 11, 6, 3, 10, 0, 8, 9, 10, 11,
      ],
    })
  ).toEqual([6, 12, 18, 19, 20]);
});
