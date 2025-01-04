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
describe("rl3x5 数据：", () => {
	it("默认排除每一列的第一个位置的图标信息", () => {
		expect(
			slot.getRl3x5({
				rl: [
					[5, 2, 6, 6],
					[7, 2, 0, 6],
					[8, 4, 8, 3],
					[2, 7, 8, 2],
					[7, 5, 6, 8],
				],
			})
		).toEqual([
			[2, 6, 6],
			[2, 0, 6],
			[4, 8, 3],
			[7, 8, 2],
			[5, 6, 8],
		]);
	});
	it("不进行图片位置排除", () => {
		expect(
			slot.getRl3x5({
				rl: [
					[5, 2, 6, 6],
					[7, 2, 0, 6],
					[8, 4, 8, 3],
					[2, 7, 8, 2],
					[7, 5, 6, 8],
				],
				colIndex: -1,
			})
		).toEqual([
			[5, 2, 6, 6],
			[7, 2, 0, 6],
			[8, 4, 8, 3],
			[2, 7, 8, 2],
			[7, 5, 6, 8],
		]);
	});
});
