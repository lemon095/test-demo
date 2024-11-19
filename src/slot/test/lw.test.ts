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
describe("lw 基础中奖金额", () => {
	it("不存在 rwsp 信息时", () => {
		expect(slot.getLw({})).toBeNull();
	});
	it("只有 rwsp 信息，不存在 snww", () => {
		expect(
			slot.getLw({
				rwsp: {
					"3": 50,
				},
			})
		).toEqual({
			3: 100,
		});
	});
	it("存在 rwsp 信息和 snww信息", () => {
		expect(
			slot.getLw({
				rwsp: {
					"9": 4,
				},
				snww: {
					"9": 4,
				},
			})
		).toEqual({
			9: 32,
		});
	});
});
