import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import {
	RL_WEIGHTS,
	TRL_WEIGHTS,
	FIXED_PRICE_ROUTES,
	ICON_MUL_MAP,
} from "../TetWeights";
import { UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 2,
	ml: 1,
});
describe("wp and twp: 相邻中奖线信息处理", () => {
	it("rl和 trl都中奖的情况：", () => {
		const winnerResult = slot.getAdjoinWp({
			rl: [
				[10, 12, 8, 10, 11],
				[10, 3, 12, 3, 6],
				[10, 9, 9, 4, 10],
				[11, 10, 10, 10, 10],
				[6, 6, 6, 11, 11],
				[8, 7, 7, 12, 7],
			],
			trl: [3, 10, 5, 3],
		});
		expect(winnerResult).toEqual({
			wp: {
				"10": [0, 3, 5, 10, 14, 16, 17, 18, 19],
			},
			twp: {
				"10": [1],
			},
			winnerLineCount: {
				"10": 4,
			},
		});
	});
});
