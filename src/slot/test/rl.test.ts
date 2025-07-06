import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
import { chunk, flattenDeep } from "lodash";
import { RL_WEIGHTS, TRL_WEIGHTS } from "slot/TetWeights";
import { UserType } from "utils/helper";
const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
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
  it("@rl随机，指定图标出现的数量不能超过5次", () => {
    const rl = slot.randomRl(
      slot.convertWeights([
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
      ]),
      6,
      [
        [1, 5],
        [0, 5],
      ]
    );
    const duobaoIcons = flattenDeep(rl).filter((icon) => icon === 1);
    const duobaoCount = duobaoIcons.length;
    // 检测夺宝出现的数量小于6
    expect(duobaoCount).toBeLessThan(6);
    // 检测夺宝的数量等于5次
    expect(duobaoIcons).toHaveLength(5);
    // 检测夺宝的数量大于4次
    expect(duobaoCount).toBeGreaterThan(4);

    const baidaIcons = flattenDeep(rl).filter((icon) => icon === 0);
    const baidaCount = baidaIcons.length;
    // 检测百搭出现的数量小于6
    expect(baidaCount).toBeLessThan(6);
    // 检测百搭的数量等于5次
    expect(baidaIcons).toHaveLength(5);
    // 检测百搭的数量大于4次
    expect(baidaCount).toBeGreaterThan(4);
  });
  it("@rl随机，指定图标出现的数量不能超过0次", () => {
    const rl = slot.randomRl(
      slot.convertWeights([
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
      ]),
      6,
      [
        [1, 0],
        [0, 0],
      ]
    );
    const duobaoIcons = flattenDeep(rl).filter((icon) => icon === 1);
    const duobaoCount = duobaoIcons.length;
    // 检测夺宝出现的数量小于1
    expect(duobaoCount).toBeLessThan(1);
    // 检测夺宝的数量等于0次
    expect(duobaoIcons).toHaveLength(0);
    // 检测夺宝的数量大于-1次
    expect(duobaoCount).toBeGreaterThan(-1);

    const baidaIcons = flattenDeep(rl).filter((icon) => icon === 0);
    const baidaCount = baidaIcons.length;
    // 检测百搭出现的数量小于1
    expect(baidaCount).toBeLessThan(1);
    // 检测百搭的数量等于0次
    expect(baidaIcons).toHaveLength(0);
    // 检测百搭的数量大于-1次
    expect(baidaCount).toBeGreaterThan(-1);
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
  it("@rl随机，指定图标出现的数量不能超过5次", () => {
    const rl = slot.randomRl(
      slot.convertWeights([
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
      ]),
      [7, 6, 6, 6, 5, 7],
      [
        [1, 5],
        [0, 5],
      ]
    );
    const duobaoIcons = flattenDeep(rl).filter((icon) => icon === 1);
    const duobaoCount = duobaoIcons.length;
    // 检测夺宝出现的数量小于6
    expect(duobaoCount).toBeLessThan(6);
    // 检测夺宝的数量等于5次
    expect(duobaoIcons).toHaveLength(5);
    // 检测夺宝的数量大于4次
    expect(duobaoCount).toBeGreaterThan(4);

    const baidaiIcons = flattenDeep(rl).filter((icon) => icon === 0);
    const baidaCount = baidaiIcons.length;
    // 检测百搭出现的数量小于6
    expect(baidaCount).toBeLessThan(6);
    // 检测百搭的数量等于5次
    expect(baidaiIcons).toHaveLength(5);
    // 检测百搭的数量大于4次
    expect(baidaCount).toBeGreaterThan(4);
  });
  it("@rl随机，指定图标出现的数量不能超过0次", () => {
    const rl = slot.randomRl(
      slot.convertWeights([
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
        [
          { icon: 1, weight: 200 },
          { icon: 0, weight: 200 },
          { icon: 2, weight: 1 },
        ],
      ]),
      [7, 6, 6, 6, 5, 7],
      [
        [1, 0],
        [0, 0],
      ]
    );
    const duobaoIcons = flattenDeep(rl).filter((icon) => icon === 1);
    const duobaoCount = duobaoIcons.length;
    // 检测夺宝出现的数量小于1
    expect(duobaoCount).toBeLessThan(1);
    // 检测夺宝的数量等于0次
    expect(duobaoIcons).toHaveLength(0);
    // 检测夺宝的数量大于-1
    expect(duobaoCount).toBeGreaterThan(-1);

    const baidaiIcons = flattenDeep(rl).filter((icon) => icon === 0);
    const baidaCount = baidaiIcons.length;
    // 检测百搭出现的数量小于1
    expect(baidaCount).toBeLessThan(1);
    // 检测百搭的数量等于0次
    expect(baidaiIcons).toHaveLength(0);
    // 检测百搭的数量大于-1次
    expect(baidaCount).toBeGreaterThan(-1);
  });
});
