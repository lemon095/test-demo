import { test, expect, describe, it } from "bun:test";
import BaseSlot from "..";
const slot = new BaseSlot();
describe("is not win over 15", () => {
	it("测试边界情况，比如-1,null,undefined,NaN,空字符串", () => {
		expect(slot.isNotWinOver15(-1)).toBeFalsy();
		expect(slot.isNotWinOver15(null as never)).toBeFalsy();
		expect(slot.isNotWinOver15(undefined as never)).toBeFalsy();
		expect(slot.isNotWinOver15(NaN)).toBeFalsy();
		expect(slot.isNotWinOver15("" as never)).toBeFalsy();
		expect(slot.isNotWinOver15("1" as never)).toBeFalsy();
	});
	it("输入 0 或 1 输出 false", () => {
		expect(slot.isNotWinOver15(0)).toBeFalsy();
		expect(slot.isNotWinOver15(1)).toBeFalsy();
	});
	it("输入大于等于 15，输出 true", () => {
		expect(slot.isNotWinOver15(15)).toBeTrue();
		expect(slot.isNotWinOver15(106)).toBeTrue();
	});
});

describe("is pre win", () => {
	it("input empty value, output false", () => {
		expect(slot.isPreWin({})).toBeFalse();
		expect(slot.isPreWin(null)).toBe(false);
		expect(slot.isPreWin()).toBeFalse();
	});
	it("input pre wp, output true", () => {
		expect(slot.isPreWin({ 1: [1, 2, 3] })).toBeTrue();
	});
});
describe("is DuoBao pending", () => {
	it("输入空对象输出 false", () => {
		expect(slot.isDuoBaoPending({})).toBeFalse();
	});
	it("fs.s=0&&fs.ts=10 输出 false", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: 0, ts: 10 } })).toBeFalse();
	});
	it("fs.s=null 输出 undefined", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: null } })).toBeUndefined();
	});
	it("fs.s>0&&上一次未中奖, 输出 true", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: 1, ts: 10 } })).toBeTrue();
	});
	it("fs.s===fs.ts 输出 true", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: 10, ts: 10 } })).toBeTrue();
	});
	it("fs.s >0 && fs.s !== ts && 上一次中奖 输出 true", () => {
		expect(
			slot.isDuoBaoPending({ preFs: { s: 2, ts: 10 }, preWp: { 1: [1, 2, 3] } })
		).toBeTrue();
	});
	it("fs.s === fs.s && 上一次未中奖 输出 false", () => {
		expect(
			slot.isDuoBaoPending({
				preFs: { s: 10, ts: 10 },
				preWp: { 1: [1, 2, 3] },
			})
		).toBeFalse();
	});
});
describe("random tgm", () => {
	it("随机长度为 1", () => {
		expect(slot.getRandomTgmByIcon([2])).toBe(2);
	});
	it("随机长度大于 1", () => {
		expect(slot.getRandomTgmByIcon([3, 3])).toBe(3);
	});
});
describe("tmd computed", () => {
	it("上一次中奖且中奖位置小于倍数图标的位置，本次掉落未出现 2", () => {
		expect(
			slot.getTmd({
				icons: [6, 8, 2, 6],
				preTmd: [[3, 2]],
				twp: { 9: [0] },
				trns: [6],
				tgmByIcon: 2,
				tgmWeight: [2, 3],
			})
		).toEqual([[2, 2]]);
	});
	it("上一次中奖且中奖位置大于倍数图标的位置，本次掉落未出现 2", () => {
		expect(
			slot.getTmd({
				icons: [6, 8, 2, 6],
				preTmd: [[2, 2]],
				twp: { 9: [3] },
				trns: [6],
				tgmByIcon: 2,
				tgmWeight: [2, 3],
			})
		).toEqual([[2, 2]]);
	});
	it("上一次中奖且中奖位置大于倍数图标的位置，本次掉落出现 2", () => {
		expect(
			slot.getTmd({
				icons: [6, 2, 4, 6],
				preTmd: [[1, 2]],
				twp: { 9: [2, 3] },
				trns: [2, 3],
				tgmByIcon: 2,
				tgmWeight: [2, 2],
			})
		).toEqual([
			[1, 2],
			[2, 2],
		]);
	});
	// 测试用例处理
});
