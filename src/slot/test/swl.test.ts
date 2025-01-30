import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
import { RL_WEIGHTS, TRL_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
  userType: UserType.common,
  cs: 2,
  ml: 1,
});
describe("swl: swlb信息不存在或异常数据", () => {
  it("swlb 信息为 null：", () => {
    const rswl = slot.getSwl(null);
    expect(rswl).toBeNull();
  });
  it("swlb信息为 undefined", () => {
    const rswl = slot.getSwl(undefined);
    expect(rswl).toBeNull();
  });
  it("swlb信息为 空数组", () => {
    const rswl = slot.getSwl([]);
    expect(rswl).toBeNull();
  });
  it("swlb信息中存在异常位置信息", () => {
    const rswl = slot.getSwl([[NaN, 1]]);
    expect(rswl).toBeNull();
  });
});

describe("swl: 存在 swlb信息", () => {
  it("swlb信息中不存在过程形态", () => {
    expect(
      slot.getSwl([
        [5, 4],
        [7, 4],
        [9, 4],
      ])
    ).toBeNull();
  });
  it("swlb信息中存在多个过程形态", () => {
    expect(
      slot.getSwl([
        [5, 2],
        [7, 3],
        [9, 4],
      ])
    ).toEqual([
      [5, 2],
      [7, 3],
    ]);
  });
  it("swlb信息中存在过程形态", () => {
    expect(
      slot.getSwl([
        [5, 4],
        [7, 2],
        [9, 4],
      ])
    ).toEqual([[7, 2]]);
  });
});
