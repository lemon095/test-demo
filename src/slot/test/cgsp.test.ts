import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber } from "lodash";

describe("墨西哥: cgsp 金框位移信息", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,
    userType: UserType.common,
    cs: 0,
    ml: 0,
    prevSi: { wp: { 1: 1 } },
  });
  it("列最后一个位置被消除，金框需要位移一个格子", () => {
    expect(
      slot.getCgsp({
        preGsp: [5, 6, 9, 10],
        preOrl: [
          8, 10, 8, 6, 8, 10, 10, 8, 5, 4, 8, 6, 6, 5, 10, 2, 10, 2, 7, 10,
        ],
        prePtr: [2, 7],
        columnsLength: [
          [0, 3],
          [4, 7],
          [8, 11],
          [12, 15],
          [16, 19],
        ],
      })
    ).toEqual([
      [5, 6],
      [6, 7],
    ]);
  });
});

describe("黑帮: 非固定列cgsp 金框位移信息", () => {
  const slot = new BaseSlot({
    rlWeights: RL_WEIGHTS,
    trlWeights: TRL_WEIGHTS,
    userType: UserType.common,
    cs: 0,
    ml: 0,
    prevSi: { wp: { 1: 1 } },
  });
  it("列最后一个位置被消除，金框需要位移一个格子", () => {
    expect(
      slot.getCgsp({
        preGsp: [6, 8, 10, 11, 17, 18, 19],
        preOrl: [
          11, 8, 11, 6, 8, 11, 9, 4, 0, 9, 0, 6, 9, 11, 6, 3, 10, 0, 8, 9, 10,
          11,
        ],
        prePtr: [0, 2, 5, 13, 21],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
      })
    ).toEqual([
      [11, 12],
      [18, 19],
      [19, 20],
    ]);
  });
  it("金框的下一个格子为百搭，百搭下面有一个格子消除，则需要位移两个格子", () => {
    expect(
      slot.getCgsp({
        preGsp: [10, 14, 18, 19],
        preOrl: [
          5, 2, 10, 2, 7, 3, 12, 12, 7, 5, 0, 12, 10, 9, 11, 9, 8, 10, 12, 0,
          11, 9,
        ],
        prePtr: [0, 2, 4, 5, 7, 8, 13, 15, 21],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        prevGswp: [10, 19],
      })
    ).toEqual([
      [14, 15],
      [18, 20],
    ]);
  });
  it("最上面为金框，最下面为百搭，则需要位移两个格子", () => {
    expect(
      slot.getCgsp({
        preGsp: [14, 17],
        preOrl: [
          4, 3, 12, 12, 12, 9, 8, 12, 5, 8, 9, 12, 10, 9, 9, 12, 12, 0, 11, 12,
          11, 4,
        ],
        prePtr: [2, 3, 4, 7, 11, 15, 16, 19],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        prevGswp: [17],
      })
    ).toEqual([[14, 16]]);
  });
  it("金框的下一个格子为百搭，百搭下面没有消除，则不移动格子", () => {
    expect(
      slot.getCgsp({
        preGsp: [19, 20],
        preOrl: [
          11, 3, 12, 4, 12, 9, 5, 9, 6, 12, 8, 12, 12, 9, 9, 12, 11, 12, 12, 11,
          0, 10,
        ],
        prePtr: [2, 4, 9, 11, 12, 15, 17, 18],
        columnsLength: [
          [0, 2],
          [3, 5],
          [6, 9],
          [10, 13],
          [14, 17],
          [18, 21],
        ],
        prevGswp: [20],
      })
    ).toEqual([]);
  });
});
