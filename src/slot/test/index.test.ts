import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
import { chunk } from "lodash";
import { RL_WEIGHTS, TRL_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";

describe("通用：是否超过15", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
	});
	// it("测试边界情况，比如-1,null,undefined,NaN,空字符串", () => {
	// 	expect(slot.isNotWinOver15).toBeFalsy();
	// 	expect(slot.isNotWinOver15(null as never)).toBeFalsy();
	// 	expect(slot.isNotWinOver15(undefined as never)).toBeFalsy();
	// 	expect(slot.isNotWinOver15(NaN)).toBeFalsy();
	// 	expect(slot.isNotWinOver15("" as never)).toBeFalsy();
	// 	expect(slot.isNotWinOver15("1" as never)).toBeFalsy();
	// });
	// it("输入 0 或 1 输出 false", () => {
	// 	expect(slot.isNotWinOver15(0)).toBeFalsy();
	// 	expect(slot.isNotWinOver15(1)).toBeFalsy();
	// });
	// it("输入大于等于 15，输出 true", () => {
	// 	expect(slot.isNotWinOver15(15)).toBeTrue();
	// 	expect(slot.isNotWinOver15(106)).toBeTrue();
	// });
});
describe("通用：上一次是否中奖", () => {
	it("测试输入空值的情况，比如：{}、null、undefined", () => {
		const slot1 = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: {} },
		});
		const slot2 = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: null },
		});
		const slot3 = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(slot1.isPreWin).toBeFalse();
		expect(slot2.isPreWin).toBe(false);
		expect(slot3.isPreWin).toBeFalse();
	});
	it("测试正常情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: { 1: [1, 2, 3] } },
		});
		expect(slot.isPreWin).toBeTrue();
	});
});
describe("通用：是否为夺宝流程", () => {
	it("测试输入空值的情况，比如：{}", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {},
		});
		expect(slot.isDuoBaoPending).toBeFalse();
	});
	it("次数为0，上一次未中奖的情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: { s: 0, ts: 10 },
			},
		});
		expect(slot.isDuoBaoPending).toBeFalse();
	});
	it("次数为0，上一次中奖的情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: { s: 0, ts: 10 },
				wp: { 1: [1, 2, 3] },
			},
		});
		expect(slot.isDuoBaoPending).toBeTrue();
	});
	it("次数为空值的情况，上一次未中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: null,
			},
		});
		expect(slot.isDuoBaoPending).toBeFalse();
	});
	it("次数大于 0，上一次未中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: { s: 1, ts: 10 },
			},
		});
		expect(slot.isDuoBaoPending).toBeTrue();
	});
	it("次数和总次数相等，上一次未中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: { s: 10, ts: 10 },
			},
		});
		expect(slot.isDuoBaoPending).toBeTrue();
	});
	it("次数大于0小于总次数，上一次中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: { s: 2, ts: 10 },
				wp: { 1: [1, 2, 3] },
			},
		});
		expect(slot.isDuoBaoPending).toBeTrue();
	});
	it("次数等于总次数，上一次中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				fs: { s: 10, ts: 10 },
				wp: { 1: [1, 2, 3] },
			},
		});
		expect(slot.isDuoBaoPending).toBeFalse();
	});
});
describe("极速：随机tgm倍数", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
	});
	it("随机长度为 1", () => {
		expect(slot.getRandomTgmByIcon([2])).toBe(2);
	});
	it("随机长度大于 1", () => {
		expect(slot.getRandomTgmByIcon([3, 3])).toBe(3);
	});
});
describe("极速：tmd 计算", () => {
	it("上一次中奖且中奖位置小于倍数图标的位置，本次掉落未出现 2", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: { 1: [2] } },
		});
		expect(
			slot.getTmd({
				icons: [6, 8, 2, 6],
				preTmd: [[3, 2]],
				preTwp: { 9: [0] },
				trns: [6],
				gmByIcon: 2,
				weights: [2, 3],
			})
		).toEqual([[2, 2]]);
	});
	it("上一次中奖且中奖位置大于倍数图标的位置，本次掉落未出现 2", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: { 1: [2] } },
		});
		expect(
			slot.getTmd({
				icons: [6, 8, 2, 6],
				preTmd: [[2, 2]],
				preTwp: { 9: [3] },
				trns: [6],
				gmByIcon: 2,
				weights: [2, 3],
			})
		).toEqual([[2, 2]]);
	});
	it("上一次中奖且中奖位置大于倍数图标的位置，本次掉落出现 2", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: { 1: [2] } },
		});
		expect(
			slot.getTmd({
				icons: [2, 6, 4, 6],
				preTmd: [[0, 2]],
				preTwp: { 9: [2, 3] },
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
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: { 1: [2] } },
		});
		expect(
			slot.getTmd({
				icons: [12, 2, 9, 10],
				preTmd: [[1, 3]],
				trns: [10],
				gmByIcon: 2,
				weights: [2, 2],
			})
		).toEqual([[1, 3]]);
	});
});
describe("极速: acw计算", () => {
	it("输入上一次没中奖，本次也没中奖的情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: { wp: null },
		});
		expect(slot.getAcw({ lw: null, wp: null, oldAcw: 0 })).toBe(0);
	});
	it("上一次中奖, 本次也中奖的情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				wp: {
					"11": [1, 8, 9, 11],
				},
			},
		});
		expect(
			slot.getAcw({
				lw: {
					"9": 10.8,
				},
				wp: {
					"9": [0, 10, 11, 14, 18, 19],
				},
				oldAcw: 0.6,
			})
		).toBe(11.4);
	});
	it("输入上一次中奖，本次没中奖的情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
			prevSi: {
				wp: {
					"10": [0, 5, 6, 13, 14],
				},
			},
		});
		expect(
			slot.getAcw({
				lw: null,
				wp: null,
				oldAcw: 12.6,
			})
		).toBe(12.6);
	});
	it("输入上一次没中，本次中奖的情况", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(
			slot.getAcw({
				lw: {
					"9": 7.2,
				},
				wp: {
					"9": [2, 3, 4, 14],
				},
				oldAcw: 169.2,
			})
		).toBe(7.2);
	});
});
describe("极速：md 计算", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
	});
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
				weights: { 3: [10] },
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
				colLength: 5,
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
				weights: { 1: [2], 2: [4], 3: [10] },
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
				colLength: 5,
			})
		).toEqual([
			[10, 10],
			[13, 4],
			[15, 2],
		]);
	});
	it("上一次未中奖，多列有多个图标 2", () => {
		expect(
			slot.getMd({
				icons: [
					[2, 1, 2, 3, 2],
					[8, 8, 2, 2, 2],
					[2, 2, 2, 2, 2],
					[2, 11, 10, 10, 10],
					[9, 9, 3, 7, 7],
					[6, 12, 6, 9, 8],
				],
				gmByIcon: 2,
				weights: { 1: [2], 2: [6], 3: [10] },
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
				colLength: 5,
			})
		).toEqual([
			[0, 2],
			[2, 2],
			[4, 2],
			[7, 6],
			[9, 2],
			[10, 10],
			[13, 2],
			[14, 2],
			[15, 2],
		]);
	});
	it("上一次未中奖，都是图标 2", () => {
		expect(
			slot.getMd({
				icons: [
					[2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2],
				],
				gmByIcon: 2,
				weights: { 1: [2], 2: [4], 3: [7] },
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
				colLength: 5,
			})
		).toEqual([
			[0, 2],
			[1, 2],
			[2, 2],
			[3, 2],
			[4, 2],
			[5, 4],
			[7, 7],
			[10, 7],
			[13, 4],
			[15, 2],
			[16, 2],
			[17, 7],
			[20, 4],
			[22, 2],
			[23, 4],
			[25, 2],
			[26, 2],
			[27, 2],
			[28, 2],
			[29, 2],
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
				weights: {},
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
				colLength: 5,
			})
		).toEqual(null);
	});
	it("上一次中奖，上一次有图标 2，当前掉落信息中没有", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						11, 5, 2, 2, 8, 12, 9, 9, 6, 5, 12, 12, 6, 6, 6, 1, 1, 9, 9, 4, 9,
						9, 5, 5, 11, 12, 12, 6, 12, 6,
					],
					5
				),
				gmByIcon: 2,
				preMd: [
					[2, 2],
					[3, 2],
				],
				preBwp: {
					"11": [[1], [6, 7, 8], [10, 11]],
				},
				rns: [[11], [12, 9, 9], [12, 12], [], [], []],
				weights: {},
				colLength: 5,
			})
		).toEqual([
			[2, 2],
			[3, 2],
		]);
	});
	it("上一次中奖，上一次有图标 2，当前掉落信息中有图标 2", () => {
		expect(
			slot.getMd({
				icons: chunk(
					[
						11, 5, 2, 2, 8, 12, 9, 9, 6, 5, 12, 12, 6, 6, 6, 1, 1, 9, 9, 4, 9,
						9, 5, 5, 11, 12, 12, 6, 12, 6,
					],
					5
				),
				gmByIcon: 2,
				preMd: [
					[2, 2],
					[3, 2],
				],
				preBwp: {
					"11": [[1], [6, 7, 8], [10, 11]],
				},
				rns: [[2], [12, 9, 9], [12, 12], [], [], []],
				weights: { 1: [3] },
				colLength: 5,
			})
		).toEqual([
			[0, 3],
			[2, 2],
			[3, 2],
		]);
		expect(
			slot.getMd({
				icons: [
					[7, 11, 11, 4, 7],
					[11, 2, 4, 4, 6],
					[12, 11, 2, 2, 2],
					[12, 6, 11, 3, 3],
					[2, 7, 7, 5, 5],
					[7, 4, 10, 2, 12],
				],
				gmByIcon: 2,
				preMd: [
					[12, 7],
					[20, 2],
					[28, 3],
				],
				preBwp: {
					"8": [[0], [8, 9], [16, 17]],
				},
				rns: [[7], [11, 2], [], [12, 6], [], []],
				weights: { 1: [2], 2: [4], 3: [7] },
				colLength: 5,
			})
		).toEqual([
			[6, 2],
			[12, 7],
			[20, 2],
			[28, 3],
		]);
	});
	it("上一次中奖，上一次图标2位置位置为边界情况", () => {
		expect(
			slot.getMd({
				icons: [
					[6, 4, 8, 12, 1],
					[8, 9, 4, 3, 2],
					[0, 7, 2, 2, 2],
					[0, 1, 4, 3, 3],
					[2, 7, 7, 5, 5],
					[7, 4, 10, 2, 12],
				],
				gmByIcon: 2,
				preMd: [
					[0, 2],
					[12, 7],
					[20, 2],
					[28, 3],
				],
				preBwp: {
					"11": [[2], [3], [5], [11], [17]],
				},
				rns: [[6, 4], [8], [0], [0], [], []],
				weights: { 1: [2], 2: [4], 3: [7] },
				colLength: 5,
			})
		).toEqual([
			[2, 2],
			[12, 7],
			[20, 2],
			[28, 3],
		]);
	});
});
describe("通用: ctw计算", () => {
	it("本次没有中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(slot.getCtw({ lw: null })).toBe(0);
	});
	it("本次单个图标中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(
			slot.getCtw({
				lw: {
					"6": 7.2,
				},
			})
		).toBe(7.2);
	});
	it("多个图标中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(
			slot.getCtw({
				lw: {
					"6": 7.2,
					8: 7.2,
				},
			})
		).toBe(14.4);
	});
	it("多个图标中奖，且倍数为 3", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(
			slot.getCtw({
				lw: {
					"6": 7.2,
					8: 7.2,
				},
				gm: 3,
			})
		).toBe(43.2);
	});
});
describe("通用：rl 随机图标", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
	});
	it("rl 随机 6 行 5 列", () => {
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
	it("rl 随机 3 行 3 列", () => {
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
	it("rl 随机 3 行 1 列", () => {
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
	it("rl 随机，第一列只能出现一个夺宝图标并且第一个不能是夺宝", () => {
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
describe("通用：trl 随机图标", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
	});
	it("trl 随机 1 行 4 列", () => {
		const trl = slot.randomTrl([
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
		]);
		expect(trl).toHaveLength(4);
	});
});
describe("通用：trl 随机图标", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
	});
	it("trl 随机 1 行 3 列", () => {
		const trl = slot.randomTrl([
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
		]);
		expect(trl).toHaveLength(3);
	});
	it("trl 随机 1 行 1 列", () => {
		const trl = slot.randomTrl([[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]]);
		expect(trl).toHaveLength(1);
	});
});
describe("通用：rl 权重表", () => {
	it("试玩用户的权重表", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.trail,
			cs: 0,
			ml: 0,
		});
		expect(slot.rlTables).toBeArrayOfSize(6);
		slot.rlTables.forEach((column) => expect(column).toBeArrayOfSize(520));
	});
	it("新用户的权重表", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.newuser,
			cs: 0,
			ml: 0,
		});
		expect(slot.rlTables).toBeArrayOfSize(6);
		slot.rlTables.forEach((column) => expect(column).toBeArrayOfSize(520));
	});
	it("普通用户的权重表", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(slot.rlTables).toBeArrayOfSize(6);
		slot.rlTables.forEach((column) => expect(column).toBeArrayOfSize(520));
	});
});
describe("通用：trl 权重表", () => {
	it("试玩用户的权重表", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.trail,
			cs: 0,
			ml: 0,
		});
		expect(slot.trlTables).toBeArrayOfSize(4);
		slot.trlTables.forEach((column) => expect(column).toBeArrayOfSize(130));
	});
	it("新用户的权重表", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.newuser,
			cs: 0,
			ml: 0,
		});
		expect(slot.trlTables).toBeArrayOfSize(4);
		slot.trlTables.forEach((column) => expect(column).toBeArrayOfSize(130));
	});
	it("普通用户的权重表", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		expect(slot.trlTables).toBeArrayOfSize(4);
		slot.trlTables.forEach((column) => expect(column).toBeArrayOfSize(130));
	});
});
