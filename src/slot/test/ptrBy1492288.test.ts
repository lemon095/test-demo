import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber, values } from "lodash";

const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 0,
	ml: 0,
});
describe("墨西哥: 获取ptr的消除数据", () => {
	it("存在金框中奖的情况，只能获取到普通框的消除数据", () => {
		expect(
			slot.getPtrBy1492288({
				wp: {
					"10": [1, 6, 10],
				},
				gsp: [6, 7, 11],
				rl: [
					[3, 8, 1, 9],
					[3, 6, 8, 5],
					[3, 7, 8, 5],
					[9, 10, 3, 8],
					[10, 9, 8, 5],
				],
			})
		).toEqual([1, 10]);
	});
	it("上一次为金框中奖这次变为百搭中奖的情况，需要获取到百搭位置和普通框位置", () => {
		expect(
			slot.getPtrBy1492288({
				wp: {
					"2": [1, 5, 9],
					"16": [1, 6, 9],
				},
				gsp: [6, 5],
				rl: [
					[6, 3, 4, 4],
					[5, 3, 0, 10],
					[4, 3, 7, 7],
					[3, 8, 8, 9],
					[4, 2, 3, 3],
				],
			})
		).toEqual([1, 6, 9]);
	});
});
