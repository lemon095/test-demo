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
describe("墨西哥 cgm 的逻辑", () => {
	it("mf无倍率信息", () => {
		expect(
			slot.getCgm({
				wsp: [9],
				mf: {},
			})
		).toEqual(0);
	});
});
