import { describe, it, expect } from 'bun:test';
import BaseSlot from '../index';

// 构造一个测试用的子类，方便直接调用静态方法
class TestSlot extends BaseSlot<any> {}

describe('getWinnerByCount', () => {
  it('基础功能：普通图标中奖', () => {
    const rl = [
      [2, 3, 4],
      [2, 3, 4],
      [2, 3, 4],
    ];
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 3, duobaoIcon: 1, baidaIcon: 0 });
    expect(wp['2']).toEqual([0, 3, 6]);
    expect(wp['3']).toEqual([1, 4, 7]);
    expect(wp['4']).toEqual([2, 5, 8]);
    expect(iconWinnerCount['2']).toBe(3);
    expect(iconWinnerCount['3']).toBe(3);
    expect(iconWinnerCount['4']).toBe(3);
  });

  it('边界：夺宝图标数量超过8个，不参与中奖', () => {
    const rl = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ];
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 8, duobaoIcon: 1, baidaIcon: 0 });
    expect(wp['1']).toBeUndefined();
    expect(iconWinnerCount['1']).toBeUndefined();
  });

  it('百搭图标可参与任意图标中奖', () => {
    const rl = [
      [0, 2, 2],
      [2, 0, 2],
      [2, 2, 0],
    ];
    // 百搭为0，普通图标为2
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 8, duobaoIcon: 1, baidaIcon: 0 });
    // 2的中奖索引应包含所有2和所有0的位置
    const all2 = [1,2,3,5,6,7];
    const all0 = [0,4,8];
    const expected = [...all2, ...all0].sort((a,b)=>a-b);
    expect(wp['2']).toEqual(expected);
    expect(iconWinnerCount['2']).toBe(expected.length);
  });

  it('百搭图标自身中奖时索引不重复', () => {
    const rl = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    // 百搭为0
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 8, duobaoIcon: 1, baidaIcon: 0 });
    // 百搭自身中奖，索引不能重复
    expect(wp['0']).toEqual([0,1,2,3,4,5,6,7,8]);
    expect(iconWinnerCount['0']).toBe(9);
  });

  it('混合：百搭和普通图标数量都不够，不中奖', () => {
    const rl = [
      [0, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 8, duobaoIcon: 1, baidaIcon: 0 });
    expect(wp['2']).toBeUndefined();
    expect(wp['0']).toBeUndefined();
    expect(iconWinnerCount['2']).toBeUndefined();
    expect(iconWinnerCount['0']).toBeUndefined();
  });

  it('边界：只有百搭图标，数量刚好中奖', () => {
    const rl = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 9, duobaoIcon: 1, baidaIcon: 0 });
    expect(wp['0']).toEqual([0,1,2,3,4,5,6,7,8]);
    expect(iconWinnerCount['0']).toBe(9);
  });

  it('边界：没有任何图标中奖', () => {
    const rl = [
      [2, 3, 4],
      [5, 6, 7],
      [8, 9, 10],
    ];
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 5, duobaoIcon: 1, baidaIcon: 0 });
    expect(Object.keys(wp).length).toBe(0);
    expect(Object.keys(iconWinnerCount).length).toBe(0);
  });

  it('边界：百搭图标数量不足自身中奖但能参与其他图标中奖', () => {
    const rl = [
      [0, 2, 2],
      [2, 0, 2],
      [2, 2, 3],
    ];
    // 百搭为0，普通图标为2，winnerCount为6
    // 百搭自身只有2个，不足6，不中奖
    // 2有6个，加上2个百搭，共8个，应该中奖
    const { wp, iconWinnerCount } = TestSlot.prototype.getWinnerByCount({ rl, winnerCount: 6, duobaoIcon: 1, baidaIcon: 0 });
    expect(wp['0']).toBeUndefined();
    // 2的中奖索引应包含所有2和所有0的位置
    const all2 = [1,2,3,5,6,7];
    const all0 = [0,4];
    const expected = [...all2, ...all0].sort((a,b)=>a-b);
    expect(wp['2']).toEqual(expected);
    expect(iconWinnerCount['2']).toBe(expected.length);
  });
});
