import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
import { chunk } from "lodash";
import { RL_WEIGHTS, TRL_WEIGHTS } from "slot/TetWeights";
import { UserType } from "utils/helper";
const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
  userType: UserType.common,
  cs: 0,
  ml: 0,
});
describe("@固定行列数量的rl随机图标", () => {
  it("@rl随机6行5列", () => {
    const rl = slot.randomRl(
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      5
    );
    expect(rl).toHaveLength(6);
    rl.forEach((column) => {
      expect(column).toHaveLength(5);
    });
  });
  it("@rl随机3行3列", () => {
    const rl = slot.randomRl(
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      3
    );
    expect(rl).toHaveLength(3);
    rl.forEach((column) => {
      expect(column).toHaveLength(3);
    });
  });
  it("@rl随机3行1列", () => {
    const rl = slot.randomRl(
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      1
    );
    expect(rl).toHaveLength(3);
    rl.forEach((column) => {
      expect(column).toHaveLength(1);
    });
  });
  it("@rl随机，第一列只能出现一个夺宝图标并且第一个不能是夺宝", () => {
    const rl = slot.randomRl(
      [
        [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        ],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      5
    );
    // 检测第一个是不是夺宝图标
    expect(rl[0][0]).toEqual(0);
    // 检测第一列是否只有一个夺宝图标
    expect(rl[0].filter((icon) => icon === 1)).toHaveLength(1);
  });
});

describe("@非固定列数量的rl随机图标", () => {
  it("@rl随机6行非固定列335546", () => {
    const columnLengths = [3, 3, 5, 5, 4, 6];
    const rl = slot.randomRl(
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      columnLengths
    );
    expect(rl).toHaveLength(6);
    rl.forEach((column, index) => {
      expect(column).toHaveLength(columnLengths[index]);
    });
  });
  it("@rl随机5行非固定列45454", () => {
    const columnLengths = [4, 5, 4, 5, 4];
    const rl = slot.randomRl(
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      columnLengths
    );
    expect(rl).toHaveLength(5);
    rl.forEach((column, index) => {
      expect(column).toHaveLength(columnLengths[index]);
    });
  });
  it("@rl随机6行非固定列334444", () => {
    const columnLengths = [3, 3, 4, 4, 4, 4];
    const rl = slot.randomRl(
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      columnLengths
    );
    expect(rl).toHaveLength(6);
    rl.forEach((column, index) => {
      expect(column).toHaveLength(columnLengths[index]);
    });
  });
  it("@rl随机，第一列只能出现一个夺宝图标并且第一个不能是夺宝", () => {
    const rl = slot.randomRl(
      [
        [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
        ],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ],
      [5, 5, 5, 5, 5, 5]
    );
    // 检测第一个是不是夺宝图标
    expect(rl[0][0]).toEqual(0);
    // 检测第一列是否只有一个夺宝图标
    expect(rl[0].filter((icon) => icon === 1)).toHaveLength(1);
  });
});
