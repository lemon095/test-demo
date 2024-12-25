import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import {
	RL_WEIGHTS,
	TRL_WEIGHTS,
	MF_WEIGHTS,
	Merge_Frame_Weight,
	Icon_Ids,
	Silver_Frame_Weight,
} from "../TetWeights";
import { RnsCalculateType, UserType } from "utils/helper";
import { chunk, flatMapDeep, keys, values } from "lodash";

describe("百搭和夺宝的合并", () => {
	it("百搭不合并：百搭的最大合并数量为1", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		const [, newRL] = slot.getEbb({
			rl: [
				[5, 8, 4, 11, 12],
				[5, 5, 8, 7, 8],
				[0, 0, 0, 0, 0],
				[11, 11, 4, 3, 3],
				[7, 10, 3, 9, 7],
				[10, 4, 1, 8, 7],
			],
			mergeWeights: [
				[2, 3],
				[3, 2],
			],
			iconIds: Icon_Ids,
			silverWeights: Silver_Frame_Weight,
			maxCountByBaiDa: 1,
		});
		expect(newRL[2]).not.toContain(0);
	});
	it("夺宝不合并：夺宝的最大合并数量为1", () => {
		const slot = new BaseSlot({
			rlWeights: RL_WEIGHTS,
			trlWeights: TRL_WEIGHTS,
			userType: UserType.common,
			cs: 0,
			ml: 0,
		});
		const [, newRL] = slot.getEbb({
			rl: [
				[5, 8, 4, 11, 12],
				[5, 5, 8, 7, 8],
				[1, 1, 1, 1, 1],
				[11, 11, 4, 3, 3],
				[7, 10, 3, 9, 7],
				[10, 4, 1, 8, 7],
			],
			mergeWeights: [
				[2, 3],
				[3, 2],
			],
			iconIds: Icon_Ids,
			silverWeights: Silver_Frame_Weight,
			maxCountByDuobao: 1,
		});
		expect(newRL[2]).not.toContain(1);
	});
});
