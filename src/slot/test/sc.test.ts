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
describe("获取夺宝数量", () => {
	it("无合并框的逻辑", () => {
		expect(
			slot.getSc({
				rl: chunk(
					[3, 4, 3, 8, 3, 4, 4, 1, 3, 1, 4, 3, 3, 10, 2, 3, 5, 10, 6, 1],
					4
				),
			})
		).toEqual(3);
		expect(
			slot.getSc({
				rl: chunk(
					[3, 4, 3, 8, 3, 4, 4, 3, 3, 3, 4, 3, 3, 10, 2, 3, 5, 10, 6, 1],
					4
				),
			})
		).toEqual(1);
		expect(
			slot.getSc({
				rl: chunk(
					[3, 4, 3, 8, 3, 4, 4, 3, 3, 3, 4, 3, 3, 10, 2, 3, 5, 10, 6, 3],
					4
				),
			})
		).toEqual(0);
	});
	it("墨西哥：跳过第一行的信息", () => {
		expect(
			slot.getSc({
				rl: [
					[3, 1, 3, 8],
					[1, 4, 1, 3],
					[3, 1, 4, 1],
					[3, 1, 2, 3],
					[1, 1, 6, 3],
				],
				skipRow: 1,
			})
		).toEqual(6);
	});
});
