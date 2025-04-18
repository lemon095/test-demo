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
        isPrevWin: false,
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
        isPrevWin: false,
      })
    ).toEqual([
      [0, 1],
      [19, 1],
    ]);
  });
  it("@rl中都是百搭数据", () => {
    const nswl = Array(20)
      .fill(0)
      .map((_, index) => [index, 1]) as [number, number][];
    expect(
      slot.getNswl({
        rl: [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        isPrevWin: false,
      })
    ).toEqual(nswl);
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
        isPrevWin: false,
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
        isPrevWin: false,
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
        isPrevWin: false,
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
describe("nswl: @上一局中奖的情况", () => {
  it("@上一局中奖，且未出现新的百搭数据", () => {
    expect(
      slot.getNswl({
        rl: [
          [7, 4, 3, 5],
          [8, 0, 5, 7],
          [7, 8, 7, 5],
          [8, 4, 7, 8],
          [6, 7, 2, 7],
        ],
        prevSwlb: [[5, 2]],
        isPrevWin: true,
      })
    ).toBeNull();
  });
  // it("@rns掉落，存在百搭数据但该百搭未中奖", () => {
  //   expect(
  //     slot.getNswl({
  //       rl: [
  //         [7, 4, 3, 5],
  //         [8, 2, 0, 7],
  //         [7, 8, 7, 5],
  //         [8, 4, 7, 8],
  //         [6, 7, 2, 7],
  //       ],
  //       rns: [[0], [8, 5], [4], [7, 8], null],
  //       isPrevWin: true,
  //       wp: {
  //         17: [3, 6, 11],
  //       },
  //     })
  //   ).toEqual([[0, 1]]);
  // });
  // it("@rns掉落，存在百搭数据且掉落百搭参与中奖", () => {
  //   expect(
  //     slot.getNswl({
  //       rl: [
  //         [7, 4, 3, 5],
  //         [8, 2, 0, 7],
  //         [7, 8, 7, 5],
  //         [8, 2, 7, 8],
  //         [6, 7, 0, 7],
  //       ],
  //       isPrevWin: true,
  //       rns: [[0, 0, 0, 0], [8, 5], [4], [7, 8], null],
  //       wp: {
  //         17: [3, 6, 11],
  //       },
  //     })
  //   ).toEqual([
  //     [0, 1],
  //     [1, 1],
  //     [2, 1],
  //     [3, 2],
  //   ]);
  // });
  it("@rns掉落，存在百搭数据", () => {
    expect(
      slot.getNswl({
        rl: [
          [6, 6, 5, 2],
          [7, 6, 0, 3],
          [2, 0, 5, 0],
          [8, 7, 4, 6],
          [3, 7, 2, 5],
        ],
        isPrevWin: true,
        prevSwlb: [
          [11, 3],
          [6, 3],
        ],
        prevPtbr: [1, 14, 10, 2, 3],
        wp: {
          "1": [2, 6, 10],
          "2": [1, 5, 9],
          "4": [1, 6, 11],
          "5": [3, 6, 9],
          "12": [2, 6, 9],
          "13": [2, 6, 11],
          "16": [1, 6, 9],
          "17": [3, 6, 11],
        },
      })
    ).toEqual([[9, 2]]);
  });
});
