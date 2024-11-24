import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber } from "lodash";

describe("墨西哥: cgsp 金框位移信息", () => {
	const slot = new BaseSlot({
		rlWeights: RL_WEIGHTS,
		trlWeights: TRL_WEIGHTS,
		userType: UserType.common,
		cs: 0,
		ml: 0,
		prevSi: { wp: { 1: 1 } },
	});
	it("列最后一个位置被消除，金框需要位移一个格子", () => {
		expect(
			slot.getCgsp({
				preGsp: [5, 6, 9, 10],
				preOrl: [
					8, 10, 8, 6, 8, 10, 10, 8, 5, 4, 8, 6, 6, 5, 10, 2, 10, 2, 7, 10,
				],
				prePtr: [2, 7],
				colLength: 4,
			})
		).toEqual([
			[5, 6],
			[6, 7],
		]);
	});
});
