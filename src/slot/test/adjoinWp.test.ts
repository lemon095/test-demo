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
describe("@wp和twp:相邻中奖线信息处理", () => {
  describe("@rl和trl都存在的情况", () => {
    it("@4连线rl和trl都存在中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [10, 12, 8, 10, 11],
            [10, 3, 12, 3, 6],
            [10, 9, 9, 4, 10],
            [11, 10, 10, 10, 10],
            [6, 6, 6, 11, 11],
            [8, 7, 7, 12, 7],
          ],
          trl: [3, 10, 5, 3],
        })
      ).toEqual({
        wp: {
          "10": [0, 3, 5, 10, 14, 16, 17, 18, 19],
        },
        twp: {
          "10": [1],
        },
        winnerLineCount: {
          "10": 4,
        },
      });
    });
    it("@5连线rl和trl都存在中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [6, 11, 10, 4, 11],
            [11, 1, 8, 5, 9],
            [6, 4, 12, 8, 10],
            [11, 11, 5, 0, 8],
            [9, 2, 2, 7, 7],
            [9, 3, 8, 4, 7],
          ],
          trl: [9, 11, 10, 11],
        })
      ).toEqual({
        wp: {
          "11": [1, 4, 5, 15, 16, 18],
        },
        twp: {
          "11": [1, 3],
        },
        winnerLineCount: {
          "11": 5,
        },
      });
    });
  });
});
describe("@wp非固定列的中奖情况", () => {
  describe("@僵尸数据", () => {
    it("@5连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [12, 1, 12, 11],
            [0, 99, 99, 99, 99],
            [6, 6, 12, 9],
            [12, 5, 11, 11, 11],
            [6, 6, 12, 11],
          ],
        })
      ).toEqual({
        wp: {
          "12": [0, 2, 4, 11, 13, 20],
        },
        twp: null,
        winnerLineCount: {
          "12": 5,
        },
      });
    });
    it("@4连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [1, 9, 1, 11],
            [0, 99, 99, 99, 99],
            [6, 6, 6, 9],
            [0, 99, 99, 99, 99],
            [10, 6, 6, 11],
          ],
        })
      ).toEqual({
        wp: {
          "9": [1, 4, 12, 13],
        },
        twp: null,
        winnerLineCount: {
          "9": 4,
        },
      });
      expect(
        slot.getAdjoinWp({
          rl: [
            [9, 5, 5, 11],
            [7, 2, 2, 9, 3],
            [10, 4, 9, 9],
            [0, 99, 99, 99, 99],
            [2, 2, 6, 12],
          ],
        })
      ).toEqual({
        wp: {
          "9": [0, 7, 11, 12, 13],
        },
        twp: null,
        winnerLineCount: {
          "9": 4,
        },
      });
    });
    it("@3连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [10, 3, 6, 2],
            [0, 99, 99, 99, 99],
            [11, 4, 10, 3],
            [1, 4, 6, 6, 12],
            [3, 8, 8, 8],
          ],
        })
      ).toEqual({
        wp: {
          "3": [1, 4, 12],
          "10": [0, 4, 11],
        },
        twp: null,
        winnerLineCount: {
          "3": 3,
          "10": 3,
        },
      });
      expect(
        slot.getAdjoinWp({
          rl: [
            [6, 6, 6, 2],
            [0, 99, 99, 99, 99],
            [2, 2, 11, 4],
            [1, 4, 6, 6, 12],
            [3, 8, 8, 8],
          ],
        })
      ).toEqual({
        wp: {
          "2": [3, 4, 9, 10],
        },
        twp: null,
        winnerLineCount: {
          "2": 3,
        },
      });
    });
    it("@未中奖数据", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [10, 1, 1, 11],
            [0, 99, 99, 99, 99],
            [8, 6, 6, 6],
            [0, 99, 99, 99, 99],
            [10, 6, 6, 11],
          ],
        })
      ).toEqual({ wp: null, winnerLineCount: null, twp: null });
      expect(
        slot.getAdjoinWp({
          rl: [
            [10, 3, 3, 3],
            [7, 2, 9, 3, 3],
            [12, 9, 5, 5],
            [9, 9, 9, 5, 11],
            [6, 6, 6, 12],
          ],
        })
      ).toEqual({ wp: null, winnerLineCount: null, twp: null });
    });
  });
  describe("@黑帮数据：需要使用orl而不是rl数据", () => {
    it("@6连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [9, 7, 2],
            [8, 2, 3],
            [7, 10, 12, 0],
            [7, 2, 7, 3],
            [9, 3, 7, 2],
            [2, 2, 2, 8],
          ],
        })
      ).toEqual({
        wp: {
          "2": [2, 4, 9, 11, 17, 18, 19, 20],
        },
        twp: null,
        winnerLineCount: {
          "2": 6,
        },
      });
    });
    it("@5连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [7, 9, 2],
            [2, 3, 9],
            [9, 10, 12, 9],
            [9, 7, 3, 9],
            [9, 3, 7, 2],
            [2, 2, 2, 8],
          ],
        })
      ).toEqual({
        wp: {
          "9": [1, 5, 6, 9, 10, 13, 14],
        },
        twp: null,
        winnerLineCount: {
          "9": 5,
        },
      });
    });
    it("@4连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [12, 5, 4],
            [12, 3, 7],
            [9, 7, 6, 12],
            [3, 11, 8, 12],
            [5, 6, 11, 5],
            [11, 10, 10, 4],
          ],
        })
      ).toEqual({
        wp: {
          "12": [0, 3, 9, 13],
        },
        twp: null,
        winnerLineCount: {
          "12": 4,
        },
      });
      expect(
        slot.getAdjoinWp({
          rl: [
            [7, 4, 12],
            [11, 8, 7],
            [12, 8, 7, 4],
            [9, 7, 2, 3],
            [4, 2, 4, 11],
            [12, 3, 1, 8],
          ],
        })
      ).toEqual({
        wp: {
          "7": [0, 5, 8, 11],
        },
        twp: null,
        winnerLineCount: {
          "7": 4,
        },
      });
    });
    it("@3连中奖", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [8, 7, 4],
            [7, 4, 3],
            [4, 9, 3, 5],
            [7, 11, 10, 11],
            [7, 8, 11, 12],
            [4, 2, 11, 4],
          ],
        })
      ).toEqual({
        wp: {
          "4": [2, 4, 6],
        },
        twp: null,
        winnerLineCount: {
          "4": 3,
        },
      });
    });
    it("@未中奖数据", () => {
      expect(
        slot.getAdjoinWp({
          rl: [
            [10, 2, 8],
            [8, 5, 7],
            [7, 12, 7, 9],
            [2, 8, 3, 8],
            [10, 11, 5, 11],
            [11, 5, 2, 3],
          ],
        })
      ).toEqual({ wp: null, winnerLineCount: null, twp: null });
      expect(
        slot.getAdjoinWp({
          rl: [
            [7, 9, 7],
            [10, 8, 3],
            [7, 10, 12, 0],
            [7, 0, 7, 3],
            [9, 9, 3, 7],
            [9, 0, 0, 8],
          ],
        })
      ).toEqual({ wp: null, winnerLineCount: null, twp: null });
    });
  });
});
