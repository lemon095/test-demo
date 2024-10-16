import { test, expect, describe, it } from "bun:test";
import BaseSlot from "..";
import { chunk } from "lodash";
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
				weights: [5, 5],
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
				weights: [3, 3],
			})
		).toEqual([
			[1, 2],
			[2, 3],
			[3, 3],
		]);
	});
});
describe("极速: acw计算", () => {
	it("输入上一次没中奖，本次也没中奖的情况", () => {
		expect(slot.getAcw({ lw: null, wp: null, oldWp: null, oldAcw: 0 })).toBe(0);
	});
	it("上一次中奖, 本次也中奖的情况", () => {
		expect(
			slot.getAcw({
				lw: {
					"9": 10.8,
				},
				wp: {
					"9": [0, 10, 11, 14, 18, 19],
				},
				oldWp: {
					"11": [1, 8, 9, 11],
				},
				oldAcw: 0.6,
			})
		).toBe(11.4);
	});
	it("输入上一次中奖，本次没中奖的情况", () => {
		expect(
			slot.getAcw({
				lw: null,
				wp: null,
				oldWp: {
					"10": [0, 5, 6, 13, 14],
				},
				oldAcw: 12.6,
			})
		).toBe(12.6);
	});
	it("输入上一次没中，本次中奖的情况", () => {
		expect(
			slot.getAcw({
				lw: {
					"9": 7.2,
				},
				wp: {
					"9": [2, 3, 4, 14],
				},
				oldWp: null,
				oldAcw: 169.2,
			})
		).toBe(7.2);
	});
});
describe("极速：md 计算", () => {
	it("上一次未中奖，有图标2", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						4, 4, 8, 11, 11, 8, 8, 6, 6, 6, 2, 2, 2, 11, 11, 11, 11, 10, 10, 10,
						9, 9, 3, 7, 7, 6, 12, 6, 9, 8,
					],
					5
				),
				gmByIcon: 2,
				weights: [10],
				ebb: {
					"1": {
						fp: 5,
						lp: 6,
						bt: 2,
						ls: 1,
					},
					"2": {
						fp: 7,
						lp: 9,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 10,
						lp: 12,
						bt: 2,
						ls: 1,
					},
					"4": {
						fp: 13,
						lp: 14,
						bt: 2,
						ls: 1,
					},
					"5": {
						fp: 17,
						lp: 19,
						bt: 2,
						ls: 1,
					},
					"6": {
						fp: 20,
						lp: 21,
						bt: 2,
						ls: 1,
					},
					"7": {
						fp: 23,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
			})
		).toEqual([[10, 10]]);
	});
	it("上一次未中奖，单列有多个图标 2并且跨列", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						4, 4, 8, 11, 11, 8, 8, 6, 6, 6, 2, 2, 2, 2, 2, 2, 11, 10, 10, 10, 9,
						9, 3, 7, 7, 6, 12, 6, 9, 8,
					],
					5
				),
				gmByIcon: 2,
				weights: [10],
				ebb: {
					"1": {
						fp: 5,
						lp: 6,
						bt: 2,
						ls: 1,
					},
					"2": {
						fp: 7,
						lp: 9,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 10,
						lp: 12,
						bt: 2,
						ls: 1,
					},
					"4": {
						fp: 13,
						lp: 14,
						bt: 2,
						ls: 1,
					},
					"5": {
						fp: 17,
						lp: 19,
						bt: 2,
						ls: 1,
					},
					"6": {
						fp: 20,
						lp: 21,
						bt: 2,
						ls: 1,
					},
					"7": {
						fp: 23,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
			})
		).toEqual([
			[10, 10],
			[13, 10],
			[15, 10],
		]);
	});
	it("上一次未中奖，多列有多个图标 2", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						2, 1, 2, 3, 2, 8, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 10, 10, 10, 9,
						9, 3, 7, 7, 6, 12, 6, 9, 8,
					],
					5
				),
				gmByIcon: 2,
				weights: [10],
				ebb: {
					"1": {
						fp: 5,
						lp: 6,
						bt: 2,
						ls: 1,
					},
					"2": {
						fp: 7,
						lp: 8,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 10,
						lp: 12,
						bt: 2,
						ls: 1,
					},
					"5": {
						fp: 17,
						lp: 19,
						bt: 2,
						ls: 1,
					},
					"6": {
						fp: 20,
						lp: 21,
						bt: 2,
						ls: 1,
					},
					"7": {
						fp: 23,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
			})
		).toEqual([
			[0, 10],
			[2, 10],
			[4, 10],
			[7, 10],
			[9, 10],
			[10, 10],
			[13, 10],
			[14, 10],
			[15, 10],
		]);
	});
	it("上一次未中奖，都是图标 2", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
						2, 2, 2, 2, 2, 2, 2,
					],
					5
				),
				gmByIcon: 2,
				weights: [7],
				ebb: {
					"1": {
						fp: 5,
						lp: 6,
						bt: 2,
						ls: 1,
					},
					"2": {
						fp: 7,
						lp: 9,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 10,
						lp: 12,
						bt: 2,
						ls: 1,
					},
					"4": {
						fp: 13,
						lp: 14,
						bt: 2,
						ls: 1,
					},
					"5": {
						fp: 17,
						lp: 19,
						bt: 2,
						ls: 1,
					},
					"6": {
						fp: 20,
						lp: 21,
						bt: 2,
						ls: 1,
					},
					"7": {
						fp: 23,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
			})
		).toEqual([
			[0, 7],
			[1, 7],
			[2, 7],
			[3, 7],
			[4, 7],
			[5, 7],
			[7, 7],
			[10, 7],
			[13, 7],
			[15, 7],
			[16, 7],
			[17, 7],
			[20, 7],
			[22, 7],
			[23, 7],
			[25, 7],
			[26, 7],
			[27, 7],
			[28, 7],
			[29, 7],
		]);
	});
	it("上一次未中奖，当前没有图标2", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						4, 4, 8, 11, 11, 8, 8, 6, 6, 6, 12, 12, 12, 11, 11, 11, 11, 10, 10,
						10, 9, 9, 3, 7, 7, 6, 12, 6, 9, 8,
					],
					5
				),
				gmByIcon: 2,
				weights: [7, 8, 9, 10],
				ebb: {
					"1": {
						fp: 5,
						lp: 6,
						bt: 2,
						ls: 1,
					},
					"2": {
						fp: 7,
						lp: 9,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 10,
						lp: 12,
						bt: 2,
						ls: 1,
					},
					"4": {
						fp: 13,
						lp: 14,
						bt: 2,
						ls: 1,
					},
					"5": {
						fp: 17,
						lp: 19,
						bt: 2,
						ls: 1,
					},
					"6": {
						fp: 20,
						lp: 21,
						bt: 2,
						ls: 1,
					},
					"7": {
						fp: 23,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
			})
		).toEqual(null);
	});
});
