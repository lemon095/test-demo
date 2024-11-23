import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber, values } from "lodash";

const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 0,
	ml: 0,
});
describe("墨西哥: 获取wsp的金框中奖数据", () => {
	it("存在金框中奖的情况", () => {
		expect(
			slot.getWspBy1492288({
				wp: {
					"10": [1, 6, 10],
				},
				gsp: [6, 7, 11],
				rl: [
					[3, 8, 1, 9],
					[3, 6, 8, 5],
					[3, 7, 8, 5],
					[9, 10, 3, 8],
					[10, 9, 8, 5],
				],
			})
		).toEqual([6]);
	});
	it("上一次为金框中奖这次变为百搭中奖且有新的金框位置中奖", () => {
		expect(
			slot.getWspBy1492288({
				wp: {
					"2": [1, 5, 9],
					"16": [1, 6, 9],
					"4": [2, 5, 9],
					"18": [2, 6, 9],
				},
				gsp: [6, 5],
				rl: [
					[6, 3, 4, 4],
					[5, 3, 0, 10],
					[4, 3, 7, 7],
					[3, 8, 8, 9],
					[4, 2, 3, 3],
				],
			})
		).toEqual([5]);
	});
});
