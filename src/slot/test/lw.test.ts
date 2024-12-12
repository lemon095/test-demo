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
	cs: 0.02,
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
			3: 1,
		});
	});
	it("存在 rwsp 信息和 snww信息", () => {
		expect(
			slot.getLw({
				rwsp: {
					"4": 25,
				},
				snww: {
					"4": 1,
				},
			})
		).toEqual({
			4: 0.5,
		});
	});
});
