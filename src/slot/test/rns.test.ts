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
		expect(slot.getMf({ gmTables: MF_WEIGHTS, gsp: [2, 5, 7] })).toBeObject();
		expect(slot.getMf({ gmTables: MF_WEIGHTS, prevMf: {} })).toBeObject();
		expect(
			slot.getMf({ gmTables: MF_WEIGHTS, prevMf: { 2: 0, 5: 0, 7: 2 } })
		).toBeObject();
	});
});
