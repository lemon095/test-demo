import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { RnsCalculateType, UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

describe("相邻中奖，rs esst 掉落信息", () => {
	it("上一次中奖，存在普通框中奖", () => {
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
		const { esst, bewb } = slot.getRsEsst({
			prevBwp: {
				"8": [[0], [4], [6], [15, 16]],
				"11": [[1], [6], [11]],
			},
			prevEbb: {
				"1": {
					fp: 12,
					lp: 13,
					bt: 2,
					ls: 1,
				},
				"2": {
					fp: 15,
					lp: 16,
					bt: 2,
					ls: 1,
				},
				"3": {
					fp: 21,
					lp: 24,
					bt: 2,
					ls: 1,
				},
			},
			goldWeights: [
				{ weight: 1, icon: 2 },
				{ weight: 2, icon: 3 },
				{ weight: 3, icon: 4 },
				{ weight: 4, icon: 5 },
				{ weight: 8, icon: 6 },
				{ weight: 10, icon: 7 },
				{ weight: 6, icon: 8 },
				{ weight: 5, icon: 9 },
				{ weight: 4, icon: 10 },
				{ weight: 4, icon: 11 },
				{ weight: 4, icon: 12 },
			],
		});
		expect(esst).toBeEmptyObject();
		expect(bewb).toBeEmptyObject();
	});
});
