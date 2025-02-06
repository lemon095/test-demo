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
describe("swlb: @上一局未中奖", () => {
  it("@nswl为 null", () => {
    expect(
      slot.getSwlb({
        isPrevWin: false,
        colLength: 4,
        rowLength: 5,
      })
    ).toBeNull();
  });
  it("@nswl存在值", () => {
    expect(
      slot.getSwlb({
        nswl: [
          [0, 1],
          [19, 1],
        ],
        isPrevWin: false,
        colLength: 4,
        rowLength: 5,
      })
    ).toEqual([
      [0, 1],
      [19, 1],
    ]);
  });
});
describe("swlb: @上一局中奖", () => {
  describe("@上一局swlb信息为null", () => {
    it("@nswl信息不存在", () => {
      expect(
        slot.getSwlb({
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: null,
        })
      ).toBeNull();
    });
    it("@存在nswl信息", () => {
      expect(
        slot.getSwlb({
          nswl: [[6, 1]],
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
        })
      ).toEqual([[6, 1]]);
    });
  });
  describe("@nswl为null", () => {
    it("@百搭参与中奖", () => {
      expect(
        slot.getSwlb({
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: [[6, 2]],
          wpl: [1, 6, 7, 9, 11, 14, 17],
        })
      ).toEqual([[6, 3]]);
    });
    it("@百搭参与中奖且位置更改", () => {
      expect(
        slot.getSwlb({
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: [[6, 3]],
          wpl: [1, 5, 9, 13, 7, 15],
          prevPtbr: [1, 11, 14, 17, 9, 7],
        })
      ).toEqual([[7, 4]]);
    });
    it("@百搭不参与中奖", () => {
      expect(
        slot.getSwlb({
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: [
            [6, 2],
            [8, 1],
          ],
          wpl: [1, 6, 7, 9, 11, 14, 17],
        })
      ).toEqual([
        [6, 3],
        [8, 1],
      ]);
    });
  });
  describe("@nswl存在值", () => {
    it("@百搭参与中奖", () => {
      expect(
        slot.getSwlb({
          nswl: [[4, 2]],
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: [[6, 2]],
          wpl: [1, 6, 7, 9, 11, 14, 17],
        })
      ).toEqual([
        [4, 2],
        [6, 3],
      ]);
    });
    it("@百搭参与中奖且位置更改", () => {
      expect(
        slot.getSwlb({
          nswl: [[4, 2]],
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: [[6, 3]],
          wpl: [1, 5, 9, 13, 7, 15],
          prevPtbr: [1, 11, 14, 17, 9, 7],
        })
      ).toEqual([
        [4, 2],
        [7, 4],
      ]);
    });
    it("@百搭不参与中奖", () => {
      expect(
        slot.getSwlb({
          nswl: [[4, 2]],
          isPrevWin: true,
          colLength: 4,
          rowLength: 5,
          prevSwlb: [
            [6, 2],
            [8, 1],
          ],
          wpl: [1, 6, 7, 9, 11, 14, 17],
        })
      ).toEqual([
        [4, 2],
        [6, 3],
        [8, 1],
      ]);
    });
  });
});
