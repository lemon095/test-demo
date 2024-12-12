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
			colLength: 4,
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
			9, 3, 11, 3, 2, 8, 8, 4, 10, 11, 3, 10, 6, 0, 2, 10, 12, 9, 12, 0, 6, 6,
			6, 4, 4, 12, 5, 10, 8, 9,
		],
		orl: [
			9, 3, 11, 3, 2, 8, 8, 4, 10, 11, 3, 10, 6, 0, 2, 10, 12, 9, 12, 0, 6, 6,
			6, 4, 4, 12, 5, 10, 8, 9,
		],
		trl: [7, 11, 11, 6],
		torl: [7, 11, 11, 6],
		ebb: {
			"1": {
				fp: 20,
				lp: 22,
				bt: 2,
				ls: 1,
			},
			"2": {
				fp: 23,
				lp: 24,
				bt: 2,
				ls: 1,
			},
		},
		wp: {
			"11": [2, 9, 13, 19],
		},
		twp: {
			"11": [1, 2],
		},
		eb: {
			"1": {
				fp: 20,
				lp: 22,
				bt: 2,
				ls: 1,
			},
			"2": {
				fp: 23,
				lp: 24,
				bt: 2,
				ls: 1,
			},
		},
		esb: {
			"1": [20, 21, 22],
			"2": [23, 24],
		},
		es: {
			"1": [20, 21, 22],
			"2": [23, 24],
		},
		tptbr: [1, 2],
		snww: {
			"11": 4,
		},
		nowpr: [5, 6, 6, 6, 3, 5],
		pcwc: 1,
		fstc: null,
		st: 1,
		gt: null,
		nst: 4,
		cwc: 1,
		lw: {
			"11": 0.16,
		},
		tw: 0.16,
		ctw: 0.16,
		gwt: 1,
		rwsp: {
			"11": 2,
		},
		fs: null,
		aw: 0.16,
		tb: 0.4,
		np: -0.24,
		now: 16200,
		bwp: {
			"11": [[2], [9], [13], [19]],
		},
		ptbr: [2, 9, 13, 19],
		rs: null,
		ssaw: 0.16,
		ge: [1, 11],
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
			colLength: rl[0].length,
			iconIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			mode: RnsCalculateType.RNS随机,
		});
		console.log("rns", rns.rns);
	});
});
