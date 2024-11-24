import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber } from "lodash";

describe("墨西哥: 上一次中奖的情况下gsp金框位置信息", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
		prevSi: { wp: { 1: 1 } },
	});
	it("gsp 未发生掉落、未发生位置移动", () => {
		expect(
			slot.getGsp({
				rl: [],
				preGsp: [5, 6, 7],
				cgsp: null,
				ngsp: null,
				rate: [],
				preRl: [6, 10, 9, 9, 4, 9, 8, 8, 6, 9, 3, 7, 9, 6, 8, 10, 9, 7, 7, 8],
			})
		).toEqual([5, 6, 7]);
	});
	it("gsp 未发生掉落、未发生位置移动，且上一次金框变百搭", () => {
		expect(
			slot.getGsp({
				rl: [],
				preGsp: [5, 6, 7],
				cgsp: null,
				ngsp: null,
				rate: [],
				preRl: [5, 6, 10, 9, 4, 0, 8, 8, 7, 6, 3, 7, 9, 6, 8, 10, 9, 7, 7, 8],
			})
		).toEqual([6, 7]);
	});
});
describe("墨西哥: 上一次未中奖的情况下gsp金框位置信息", () => {
	// const slot = new BaseSlot({
	// 	rlWeights: RL_WEIGHTS,
	// 	trlWeights: TRL_WEIGHTS,
	// 	userType: UserType.common,
	// 	cs: 0,
	// 	ml: 0,
	// });
});
