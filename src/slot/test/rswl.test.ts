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
describe("rswl: swlb信息不存在或异常数据", () => {
  it("swlb 信息为 null：", () => {
    const rswl = slot.getRswl(null);
    expect(rswl).toBeNull();
  });
  it("swlb信息为 undefined", () => {
    const rswl = slot.getRswl(undefined);
    expect(rswl).toBeNull();
  });
  it("swlb信息为 空数组", () => {
    const rswl = slot.getRswl([]);
    expect(rswl).toBeNull();
  });
  it("swlb信息中存在异常位置信息", () => {
    const rswl = slot.getRswl([[NaN, 4]]);
    expect(rswl).toBeNull();
  });
});

describe("rswl: 存在 swlb信息", () => {
  it("swlb信息中不存在最终形态", () => {
    expect(
      slot.getRswl([
        [5, 2],
        [7, 3],
        [9, 2],
      ])
    ).toBeNull();
  });
  it("swlb信息中存在最终形态", () => {
    expect(
      slot.getRswl([
        [5, 2],
        [7, 3],
        [9, 4],
      ])
    ).toEqual([[9, 4]]);
  });
  it("swlb信息中存在多个最终形态", () => {
    expect(
      slot.getRswl([
        [5, 4],
        [7, 2],
        [9, 4],
      ])
    ).toEqual([
      [5, 4],
      [9, 4],
    ]);
  });
});
