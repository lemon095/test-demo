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
describe("nswl: @百搭位置边界问题验证", () => {
  it("@rl中不存在百搭", () => {
    expect(
      slot.getNswl({
        rl: [
          [7, 4, 3, 5],
          [8, 2, 3, 7],
          [7, 8, 7, 5],
          [8, 4, 7, 8],
          [6, 7, 2, 7],
        ],
      })
    ).toBeNull();
  });
  it("@rl中起始和结束位置存在百搭", () => {
    expect(
      slot.getNswl({
        rl: [
          [0, 4, 3, 5],
          [8, 2, 3, 7],
          [7, 8, 7, 5],
          [8, 4, 7, 8],
          [6, 7, 2, 0],
        ],
      })
    ).toEqual([
      [0, 1],
      [19, 1],
    ]);
  });
  it("@rl中都是百搭数据", () => {
    const nswl = Array(20)
      .fill(0)
      .map((_, index) => [index, 1]);
    expect(
      slot.getNswl({
        rl: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      })
    ).toEqual(nswl);
    console.log("nswl::===>", nswl);
  });
});
describe("nswl: @wp存在数据的情况下", () => {
  it("@中奖但不存在百搭数据", () => {
    expect(
      slot.getNswl({
        rl: [
          [7, 4, 3, 5],
          [8, 0, 5, 7],
          [7, 8, 7, 5],
          [8, 4, 7, 8],
          [6, 7, 2, 7],
        ],
        wp: {
          17: [3, 6, 11],
        },
      })
    ).toEqual([[5, 1]]);
  });
  it("@中奖且存在百搭数据", () => {
    expect(
      slot.getNswl({
        rl: [
          [7, 4, 3, 5],
          [8, 2, 0, 7],
          [7, 8, 7, 5],
          [8, 4, 7, 8],
          [6, 7, 2, 7],
        ],
        wp: {
          17: [3, 6, 11],
        },
      })
    ).toEqual([[6, 2]]);
  });
  it("@即有百搭中奖，也有未中奖的情况", () => {
    expect(
      slot.getNswl({
        rl: [
          [7, 4, 3, 5],
          [8, 2, 0, 7],
          [7, 8, 7, 5],
          [8, 2, 7, 8],
          [6, 7, 0, 7],
        ],
        wp: {
          17: [3, 6, 11],
        },
      })
    ).toEqual([
      [6, 2],
      [18, 1],
    ]);
  });
});
