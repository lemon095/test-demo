import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { RnsCalculateType, UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

describe("固定中奖路线: rns", () => {
  it("修改", () => {
    const slot = new BaseSlot({
      rlWeights: RL_WEIGHTS,
      trlWeights: TRL_WEIGHTS,
      userType: UserType.common,
      cs: 0,
      ml: 0,
    });
    const rns = slot.getRns({
      mode: RnsCalculateType.RNS随机,
      rl: chunk(
        [2, 7, 4, 4, 10, 0, 6, 6, 7, 7, 0, 5, 1, 5, 8, 3, 9, 1, 10, 5],
        4
      ),
      prevWinPos: [2],
      prevRl: [7, 4, 9, 4, 10, 9, 6, 6, 7, 7, 9, 5, 1, 5, 8, 3, 9, 1, 10, 5],
      iconIds: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
    expect(rns.rns).toEqual([[4], [], [], [], []]);
    expect(
      slot.getMf({
        gmTables: MF_WEIGHTS,
        gsp: [2, 5, 7],
        iconIds: [2, 3, 4, 5, 6],
      })
    ).toBeObject();
    expect(
      slot.getMf({ gmTables: MF_WEIGHTS, prevMf: {}, iconIds: [2, 3, 4, 5, 6] })
    ).toBeObject();
    expect(
      slot.getMf({
        gmTables: MF_WEIGHTS,
        prevMf: { 2: 0, 5: 0, 7: 2 },
        iconIds: [2, 3, 4, 5, 6],
      })
    ).toBeObject();
  });
});
describe("相邻中奖路线: rns", () => {
  const prevSi = {
    rl: [
      4, 8, 8, 1, 10, 4, 4, 11, 11, 12, 1, 10, 7, 4, 5, 10, 10, 10, 10, 10, 8,
      8, 8, 6, 6, 9, 5, 4, 11, 10,
    ],
    orl: [
      4, 8, 8, 1, 10, 4, 4, 11, 11, 12, 1, 10, 7, 4, 5, 10, 10, 10, 10, 10, 8,
      8, 8, 6, 6, 9, 5, 4, 11, 10,
    ],
    trl: [5, 5, 10, 0],
    torl: [5, 5, 10, 0],
    ebb: {
      "1": {
        fp: 5,
        lp: 6,
        bt: 2,
        ls: 1,
      },
      "2": {
        fp: 15,
        lp: 17,
        bt: 2,
        ls: 1,
      },
      "3": {
        fp: 18,
        lp: 19,
        bt: 1,
        ls: 2,
      },
      "4": {
        fp: 20,
        lp: 22,
        bt: 2,
        ls: 1,
      },
      "5": {
        fp: 23,
        lp: 24,
        bt: 2,
        ls: 1,
      },
    },
    wp: {
      "4": [0, 5, 6, 13],
    },
    twp: {
      "4": [],
    },
    eb: {
      "2": {
        fp: 15,
        lp: 17,
        bt: 2,
        ls: 1,
      },
      "3": {
        fp: 18,
        lp: 19,
        bt: 1,
        ls: 2,
      },
      "4": {
        fp: 20,
        lp: 22,
        bt: 2,
        ls: 1,
      },
      "5": {
        fp: 23,
        lp: 24,
        bt: 2,
        ls: 1,
      },
    },
    esb: {
      "1": [5, 6],
      "2": [15, 16, 17],
      "3": [18, 19],
      "4": [20, 21, 22],
      "5": [23, 24],
    },
    es: {
      "2": [15, 16, 17],
      "3": [18, 19],
      "4": [20, 21, 22],
      "5": [23, 24],
    },
    tptbr: [],
    snww: {
      "4": 1,
    },
    nowpr: [5, 5, 6, 3, 3, 5],
    pcwc: 1,
    fstc: null,
    st: 1,
    gt: null,
    nst: 4,
    cwc: 1,
    lw: {
      "4": 0.5,
    },
    tw: 0.5,
    ctw: 0.5,
    gwt: 1,
    rwsp: {
      "4": 25,
    },
    fs: null,
    aw: 0.5,
    tb: 0.4,
    np: 0.1,
    now: 6750,
    bwp: {
      "4": [[0], [5, 6], [13]],
    },
    ptbr: [0, 5, 6, 13],
    rs: null,
    ssaw: 0.5,
    ge: [1, 11],
    tbb: 0.4,
    ml: 1,
    cs: 0.02,
    pf: 2,
    wk: "0_C",
    wt: "C",
    hashr: "0:4;1;4#8;10;11#8;4;11#R#4#00122041#MV#0.4#MT#1#MG#0.5#",
    psid: "498610810440569248",
    sid: "498610810440569248",
    bl: 9999994.1,
    blab: 9999993.6,
    blb: 9999994,
    mr: null,
    ocr: null,
    wfg: null,
    wbn: null,
    pmt: null,
    wid: 0,
  };
  it("上一次中奖", () => {
    const slot = new BaseSlot({
      rlWeights: RL_WEIGHTS,
      trlWeights: TRL_WEIGHTS,
      userType: UserType.common,
      cs: 0,
      ml: 0,
    });
    const rl = chunk(
      [
        9, 3, 11, 3, 2, 8, 8, 4, 10, 11, 3, 10, 6, 0, 2, 10, 12, 9, 12, 0, 6, 6,
        6, 4, 4, 12, 5, 10, 8, 9,
      ],
      5
    );
    const rns = slot.getRns({
      rl,
      prevRl: prevSi.rl,
      prevWinPos: prevSi.ptbr || [],
      iconIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      mode: RnsCalculateType.RNS随机,
    });
    console.log("rns", rns.rns);
  });
});
describe("黑帮rns", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,
    userType: UserType.common,
    cs: 0,
    ml: 0,
  });
  it("黑帮rns测试", () => {
    const rl = [
      [0, 2],
      [3, 5],
      [6, 9],
      [10, 13],
      [14, 17],
      [18, 21],
    ].map(([start, end]) =>
      [
        3, 10, 8, 8, 6, 8, 9, 4, 0, 9, 0, 3, 6, 9, 6, 3, 10, 0, 10, 8, 9, 10,
      ].slice(start, end + 1)
    );
    console.log("rl", rl);
    const { rns } = slot.getRns({
      mode: RnsCalculateType.RNS随机,
      rl: rl,
      prevWinPos: [0, 2, 5, 13, 21],
      prevRl: [
        11, 8, 11, 6, 8, 11, 9, 4, 0, 9, 0, 6, 9, 11, 6, 3, 10, 0, 8, 9, 10, 11,
      ],
      iconIds: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    });
    expect(rns).toEqual([[3, 8], [8], [], [9], [], [10]]);
  });
});
