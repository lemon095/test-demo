import { describe, it, expect } from "bun:test";
import BaseSlot from "../index";

class TestSlot extends BaseSlot<any> {}

describe("getRm", () => {
  it("未中奖时返回初始状态", () => {
    const result = TestSlot.prototype.getRm({ wpl: [], isPrevWin: false });
    expect(result).toEqual({
      6: [0, 0] as [number, number],
      8: [0, 0] as [number, number],
      21: [0, 0] as [number, number],
      23: [0, 0] as [number, number],
    });
  });

  it("未中奖但有上一局中奖信息", () => {
    const prevRm = {
      6: [1, 2] as [number, number],
      8: [0, 0] as [number, number],
      21: [1, 4] as [number, number],
      23: [0, 0] as [number, number],
    };
    const result = TestSlot.prototype.getRm({
      wpl: [],
      isPrevWin: true,
      prevRm,
    });
    expect(result).toEqual(prevRm);
  });

  it("第一次中奖（单个位置）", () => {
    const result = TestSlot.prototype.getRm({ wpl: [6], isPrevWin: false });
    expect(result).toEqual({
      6: [1, 0] as [number, number],
      8: [0, 0] as [number, number],
      21: [0, 0] as [number, number],
      23: [0, 0] as [number, number],
    });
  });

  it("第一次中奖（多个位置）", () => {
    const result = TestSlot.prototype.getRm({ wpl: [6, 21], isPrevWin: false });
    expect(result).toEqual({
      6: [1, 0] as [number, number],
      8: [0, 0] as [number, number],
      21: [1, 0] as [number, number],
      23: [0, 0] as [number, number],
    });
  });

  it("连续中奖（同一位置多次）", () => {
    const prevRm = {
      6: [1, 0] as [number, number],
      8: [0, 0] as [number, number],
      21: [0, 0] as [number, number],
      23: [0, 0] as [number, number],
    };
    const result = TestSlot.prototype.getRm({
      wpl: [6],
      isPrevWin: true,
      prevRm,
    });
    expect(result).toEqual({
      6: [1, 2] as [number, number],
      8: [0, 0] as [number, number],
      21: [0, 0] as [number, number],
      23: [0, 0] as [number, number],
    });
  });

  it("连续中奖（多个位置多次）", () => {
    const prevRm = {
      6: [1, 2] as [number, number],
      8: [0, 0] as [number, number],
      21: [1, 4] as [number, number],
      23: [0, 0] as [number, number],
    };
    const result = TestSlot.prototype.getRm({
      wpl: [6, 21],
      isPrevWin: true,
      prevRm,
    });
    expect(result).toEqual({
      6: [1, 4] as [number, number],
      8: [0, 0] as [number, number],
      21: [1, 6] as [number, number],
      23: [0, 0] as [number, number],
    });
  });

  it("部分位置未中奖，部分位置累计中奖", () => {
    const prevRm = {
      6: [1, 2] as [number, number],
      8: [1, 0] as [number, number],
      21: [0, 0] as [number, number],
      23: [1, 2] as [number, number],
    };
    const result = TestSlot.prototype.getRm({
      wpl: [8],
      isPrevWin: true,
      prevRm,
    });
    expect(result).toEqual({
      6: [1, 2] as [number, number],
      8: [1, 2] as [number, number],
      21: [0, 0] as [number, number],
      23: [1, 2] as [number, number],
    });
  });

  it("wpl中有不在初始key范围的值", () => {
    const result = TestSlot.prototype.getRm({ wpl: [99], isPrevWin: false });
    expect(result).toEqual({
      6: [0, 0] as [number, number],
      8: [0, 0] as [number, number],
      21: [0, 0] as [number, number],
      23: [0, 0] as [number, number],
    });
  });

  it("所有位置都已累计多次中奖", () => {
    const prevRm = {
      6: [1, 4] as [number, number],
      8: [1, 2] as [number, number],
      21: [1, 6] as [number, number],
      23: [1, 0] as [number, number],
    };
    const result = TestSlot.prototype.getRm({
      wpl: [6, 8, 21, 23],
      isPrevWin: true,
      prevRm,
    });
    expect(result).toEqual({
      6: [1, 6] as [number, number],
      8: [1, 4] as [number, number],
      21: [1, 8] as [number, number],
      23: [1, 2] as [number, number],
    });
  });
});
