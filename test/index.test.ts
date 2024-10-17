import { test, expect, describe, it } from "bun:test";
import BaseSlot from "..";
const slot = new BaseSlot();
describe("通用：是否超过15", () => {
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
describe("通用：上一次是否中奖", () => {
	it("测试输入空值的情况，比如：{}、null、undefined", () => {
		expect(slot.isPreWin({})).toBeFalse();
		expect(slot.isPreWin(null)).toBe(false);
		expect(slot.isPreWin()).toBeFalse();
	});
	it("测试正常情况", () => {
		expect(slot.isPreWin({ 1: [1, 2, 3] })).toBeTrue();
	});
});
describe("通用：是否为夺宝流程", () => {
	it("测试输入空值的情况，比如：{}", () => {
		expect(slot.isDuoBaoPending({})).toBeFalse();
	});
	it("次数为0，上一次未中奖的情况", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: 0, ts: 10 } })).toBeFalse();
	});
	it("次数为0，上一次中奖的情况", () => {
		expect(
			slot.isDuoBaoPending({ preFs: { s: 0, ts: 10 }, preWp: { 1: [1, 2, 3] } })
		).toBeTrue();
	});
	it("次数为空值的情况，上一次未中奖", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: null } })).toBeUndefined();
	});
	it("次数大于 0，上一次未中奖", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: 1, ts: 10 } })).toBeTrue();
	});
	it("次数和总次数相等，上一次未中奖", () => {
		expect(slot.isDuoBaoPending({ preFs: { s: 10, ts: 10 } })).toBeTrue();
	});
	it("次数大于0小于总次数，上一次中奖", () => {
		expect(
			slot.isDuoBaoPending({ preFs: { s: 2, ts: 10 }, preWp: { 1: [1, 2, 3] } })
		).toBeTrue();
	});
	it("次数等于总次数，上一次中奖", () => {
		expect(
			slot.isDuoBaoPending({
				preFs: { s: 10, ts: 10 },
				preWp: { 1: [1, 2, 3] },
			})
		).toBeFalse();
	});
});
describe("极速：随机tgm倍数", () => {
	it("随机长度为 1", () => {
		expect(slot.getRandomTgmByIcon([2])).toBe(2);
	});
	it("随机长度大于 1", () => {
		expect(slot.getRandomTgmByIcon([3, 3])).toBe(3);
	});
});
describe("极速：tmd 计算", () => {
	it("上一次中奖且中奖位置小于倍数图标的位置，本次掉落未出现 2", () => {
		expect(
			slot.getTmd({
				icons: [6, 8, 2, 6],
				preTmd: [[3, 2]],
				twp: { 9: [0] },
				trns: [6],
				gmByIcon: 2,
				weights: [2, 3],
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
				gmByIcon: 2,
				weights: [2, 3],
			})
		).toEqual([[2, 2]]);
	});
	it("上一次中奖且中奖位置大于倍数图标的位置，本次掉落出现 2", () => {
		expect(
			slot.getTmd({
				icons: [2, 6, 4, 6],
				preTmd: [[0, 2]],
				twp: { 9: [2, 3] },
				trns: [2, 2],
				gmByIcon: 2,
				weights: [2, 3],
			})
		).toEqual([
			[0, 2],
			[2, 5],
			[3, 5],
		]);
	});
	it("上一次中奖且中奖位置小于倍数图标的位置，本次掉落出现 2", () => {
		expect(
			slot.getTmd({
				icons: [6, 1, 4, 2],
				preTmd: [[3, 2]],
				twp: { 9: [0, 1] },
				trns: [2, 2],
				gmByIcon: 2,
				weights: [2, 3],
			})
		).toEqual([
			[1, 2],
			[2, 3],
			[3, 3],
		]);
	});
});
