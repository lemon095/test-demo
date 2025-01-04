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
describe("wp3x5 数据，wp 有中奖信息", () => {
	it("默认每一列中奖的图标位置减去 1", () => {
		expect(
			slot.getWp3x5({
				rl: [[], [], [], [], []],
				wp: {
					"1": [2, 6, 10],
				},
			})
		).toEqual({
			"1": [1, 4, 7],
		});
	});
	it("不进行位置减 1 操作", () => {
		expect(
			slot.getWp3x5({
				rl: [[], [], [], [], []],
				wp: {
					"1": [2, 6, 10],
				},
				colMinusCount: 0,
			})
		).toEqual({
			"1": [2, 6, 10],
		});
	});
});
describe("wp3x5 数据，wp 没有中奖信息", () => {
	it("默认每一列中奖的图标位置减去 1", () => {
		expect(
			slot.getWp3x5({
				rl: [[], [], [], [], []],
				wp: null,
			})
		).toEqual(null);
	});
	it("不进行位置减 1 操作", () => {
		expect(
			slot.getWp3x5({
				rl: [[], [], [], [], []],
				colMinusCount: 0,
			})
		).toBeUndefined();
	});
});
