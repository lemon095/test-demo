import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS } from "../TetWeights";

describe("@eb信息计算", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,

    cs: 0.02,
    ml: 1,
  });
  describe("@水上太神奇-存在粘性百搭", () => {
    it("初始中奖", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: {
            "8": [0, 7, 10, 11, 12],
          },
          ebb: {
            "1": {
              bt: 2,
              fp: 5,
              lp: 6,
              ls: 1,
            },
            "2": {
              bt: 1,
              fp: 8,
              lp: 9,
              ls: 2,
            },
            "3": {
              bt: 1,
              fp: 10,
              lp: 12,
              ls: 2,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "5": {
              bt: 2,
              fp: 15,
              lp: 16,
              ls: 1,
            },
            "6": {
              bt: 2,
              fp: 18,
              lp: 19,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 20,
              lp: 21,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 22,
              lp: 23,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 5,
          lp: 6,
          ls: 1,
        },
        "2": {
          bt: 1,
          fp: 8,
          lp: 9,
          ls: 2,
        },
        "3": {
          bt: 1,
          fp: 10,
          lp: 12,
          ls: 1,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "5": {
          bt: 2,
          fp: 15,
          lp: 16,
          ls: 1,
        },
        "6": {
          bt: 2,
          fp: 18,
          lp: 19,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 20,
          lp: 21,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 22,
          lp: 23,
          ls: 1,
        },
      });
    });
    it("掉落1", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: {
            "8": [0, 7, 10, 11, 12],
          },
          ebb: {
            "1": {
              bt: 2,
              fp: 5,
              lp: 6,
              ls: 1,
            },
            "2": {
              bt: 1,
              fp: 8,
              lp: 9,
              ls: 2,
            },
            "3": {
              bt: 1,
              fp: 10,
              lp: 12,
              ls: 2,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "5": {
              bt: 2,
              fp: 15,
              lp: 16,
              ls: 1,
            },
            "6": {
              bt: 2,
              fp: 18,
              lp: 19,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 20,
              lp: 21,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 22,
              lp: 23,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 5,
          lp: 6,
          ls: 1,
        },
        "2": {
          bt: 1,
          fp: 8,
          lp: 9,
          ls: 2,
        },
        "3": {
          bt: 1,
          fp: 10,
          lp: 12,
          ls: 1,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "5": {
          bt: 2,
          fp: 15,
          lp: 16,
          ls: 1,
        },
        "6": {
          bt: 2,
          fp: 18,
          lp: 19,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 20,
          lp: 21,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 22,
          lp: 23,
          ls: 1,
        },
      });
    });
    it("掉落2", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: {
            "7": [0, 8, 9, 10, 11, 12],
          },
          ebb: {
            "1": {
              bt: 2,
              fp: 6,
              lp: 7,
              ls: 1,
            },
            "2": {
              bt: 1,
              fp: 8,
              lp: 9,
              ls: 2,
            },
            "3": {
              bt: 1,
              fp: 10,
              lp: 12,
              ls: 1,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "5": {
              bt: 2,
              fp: 15,
              lp: 16,
              ls: 1,
            },
            "6": {
              bt: 2,
              fp: 18,
              lp: 19,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 20,
              lp: 21,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 22,
              lp: 23,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 6,
          lp: 7,
          ls: 1,
        },
        "2": {
          bt: 1,
          fp: 8,
          lp: 9,
          ls: 1,
        },
        "3": {
          bt: 2,
          fp: 10,
          lp: 12,
          ls: 3,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "5": {
          bt: 2,
          fp: 15,
          lp: 16,
          ls: 1,
        },
        "6": {
          bt: 2,
          fp: 18,
          lp: 19,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 20,
          lp: 21,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 22,
          lp: 23,
          ls: 1,
        },
      });
    });
    it("掉落3", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: {
            "3": [0, 8, 9, 10, 11, 12],
            "12": [1, 2, 3, 4, 8, 9, 10, 11, 12],
          },
          ebb: {
            "1": {
              bt: 2,
              fp: 6,
              lp: 7,
              ls: 1,
            },
            "2": {
              bt: 2,
              fp: 8,
              lp: 9,
              ls: 2,
            },
            "3": {
              bt: 2,
              fp: 10,
              lp: 12,
              ls: 2,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "5": {
              bt: 2,
              fp: 17,
              lp: 18,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 20,
              lp: 21,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 22,
              lp: 23,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 6,
          lp: 7,
          ls: 1,
        },
        "2": {
          bt: 2,
          fp: 8,
          lp: 9,
          ls: 1,
        },
        "3": {
          bt: 2,
          fp: 10,
          lp: 12,
          ls: 1,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "5": {
          bt: 2,
          fp: 17,
          lp: 18,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 20,
          lp: 21,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 22,
          lp: 23,
          ls: 1,
        },
      });
    });
    it("掉落4", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: {
            "4": [0, 8, 9, 10, 11, 12],
            "6": [1, 8, 9, 10, 11, 12, 17, 18],
            "8": [3, 8, 9, 10, 11, 12, 15],
            "10": [2, 8, 9, 10, 11, 12, 19, 24, 27],
            "11": [4, 8, 9, 10, 11, 12],
          },
          ebb: {
            "1": {
              bt: 2,
              fp: 6,
              lp: 7,
              ls: 1,
            },
            "2": {
              bt: 2,
              fp: 8,
              lp: 9,
              ls: 1,
            },
            "3": {
              bt: 2,
              fp: 10,
              lp: 12,
              ls: 1,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "5": {
              bt: 2,
              fp: 17,
              lp: 18,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 20,
              lp: 21,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 22,
              lp: 23,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 6,
          lp: 7,
          ls: 1,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 20,
          lp: 21,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 22,
          lp: 23,
          ls: 1,
        },
      });
    });
    it("掉落5", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: {
            "8": [1, 2, 5, 6, 11, 12, 17],
          },
          ebb: {
            "1": {
              bt: 2,
              fp: 8,
              lp: 9,
              ls: 1,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 21,
              lp: 22,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 23,
              lp: 24,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 8,
          lp: 9,
          ls: 1,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 21,
          lp: 22,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 23,
          lp: 24,
          ls: 1,
        },
      });
    });
    it("掉落6", () => {
      expect(
        slot.getEb({
          stickyBaiDa: true,
          wp: null,
          ebb: {
            "1": {
              bt: 2,
              fp: 8,
              lp: 9,
              ls: 1,
            },
            "4": {
              bt: 2,
              fp: 13,
              lp: 14,
              ls: 1,
            },
            "7": {
              bt: 2,
              fp: 21,
              lp: 22,
              ls: 1,
            },
            "8": {
              bt: 2,
              fp: 23,
              lp: 24,
              ls: 1,
            },
          },
        })
      ).toEqual({
        "1": {
          bt: 2,
          fp: 8,
          lp: 9,
          ls: 1,
        },
        "4": {
          bt: 2,
          fp: 13,
          lp: 14,
          ls: 1,
        },
        "7": {
          bt: 2,
          fp: 21,
          lp: 22,
          ls: 1,
        },
        "8": {
          bt: 2,
          fp: 23,
          lp: 24,
          ls: 1,
        },
      });
    });
  });
});
