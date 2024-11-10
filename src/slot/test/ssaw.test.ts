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

describe("墨西哥 ssaw 金额计算", () => {
	it("上次为 0时", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 2,
			ml: 1,
		});
		expect(
			slot.getSsawBy1492288({
				lw: {
					3: 100,
				},
			})
		).toEqual(100);
	});
	it("上次为100时", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 2,
			ml: 1,
			prevSi: { ssaw: 100 },
		});
		expect(
			slot.getSsawBy1492288({
				lw: {
					3: 100,
				},
			})
		).toEqual(200);
	});
});
