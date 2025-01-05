import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
import {
	RL_WEIGHTS,
	TRL_WEIGHTS,
	FIXED_PRICE_ROUTES,
	ICON_MUL_MAP,
} from "../TetWeights";
import { UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

describe("aw: 累计金额计算", () => {
	it("上一次未中奖，这次中奖：", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 2,
			ml: 1,
		});
		const aw = slot.getAw({
			tw: 0.52,
			prevAw: 0,
			isPreWin: false,
			isDuoBaoPending: false,
		});
		expect(aw).toBe(0.52);
	});
	it("上一次中奖，这次中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 2,
			ml: 1,
		});
		const aw = slot.getAw({
			tw: 1.6,
			prevAw: 0.52,
			isPreWin: true,
			isDuoBaoPending: false,
		});
		expect(aw).toBe(2.12);
	});
	it("上一次中奖，这次未中奖", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 2,
			ml: 1,
		});
		const aw = slot.getAw({
			tw: 0,
			prevAw: 2.12,
			isPreWin: true,
			isDuoBaoPending: false,
		});
		expect(aw).toBe(2.12);
	});
});
