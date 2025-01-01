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
describe("snww: 获取中奖线路数", () => {
	it("bwp 和 twp 都有值的情况下", () => {
		const snww = slot.getSnww({
			bwp: {
				"10": [[0], [3], [5], [10], [14], [16, 17], [18, 19]],
			},
			twp: {
				"10": [1],
			},
			colLength: 5,
			rowLength: 6,
		});
		expect(snww).toEqual({
			"10": 12,
		});
	});
});
