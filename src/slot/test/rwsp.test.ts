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
	cs: 0,
	ml: 0,
});
describe("rwsp 中奖倍数", () => {
	it("rwsp: 3 连线中奖信息", () => {
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[6, 3, 4, 4, 5, 3, 0, 10, 4, 3, 7, 7, 3, 8, 8, 9, 4, 2, 3, 3],
					4
				),
				wp: {
					"2": [1, 5, 9],
					"16": [1, 6, 9],
				},
			})
		).toEqual({
			"2": 20,
			16: 20,
		});
	});
	it("rwsp: 4 连线中奖信息", () => {
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[7, 6, 8, 8, 2, 7, 7, 8, 6, 8, 8, 6, 5, 8, 5, 8, 3, 10, 5, 7],
					4
				),
				wp: {
					"7": [3, 7, 10, 15],
					"15": [2, 7, 10, 15],
					"19": [3, 7, 10, 13],
				},
			})
		).toEqual({
			"7": 10,
			"15": 10,
			"19": 10,
		});
	});
	it("rwsp: 5 连线中奖信息", () => {
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[7, 6, 1, 8, 2, 3, 4, 8, 6, 2, 3, 8, 5, 8, 5, 8, 3, 10, 5, 8],
					4
				),
				wp: {
					"3": [3, 7, 11, 15, 19],
				},
			})
		).toEqual({
			"3": 50,
		});
	});
	it("rwsp: wp 为空", () => {
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[7, 6, 1, 8, 2, 3, 4, 8, 6, 2, 3, 8, 5, 8, 5, 8, 3, 10, 5, 8],
					4
				),
			})
		).toBeNull();
	});
});
