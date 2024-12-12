import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { RnsCalculateType, UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

describe("ptbr 中奖信息", () => {
	it("这一次中奖，无金框", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		const ptbrInfo = slot.getPtbr({
			bwp: {
				"11": [[2], [9], [13], [19]],
			},
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
		});
		console.log("rns", ptbrInfo);
	});
});
