import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { RnsCalculateType, UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";
const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 0,
	ml: 0,
});
describe("ptbr：通用逻辑下的中奖信息", () => {
	it("这一次中奖，无金框", () => {
		const ptbrInfo = slot.getPtbr({
			bwp: {
				"11": [[2], [9], [13], [19]],
			},
			ebb: {
				"1": {
					fp: 20,
					lp: 22,
					bt: 2,
					ls: 1,
				},
				"2": {
					fp: 23,
					lp: 24,
					bt: 2,
					ls: 1,
				},
			},
		});
		expect(ptbrInfo).toEqual({
			ptbr: [2, 9, 13, 19],
			ptbrp: [],
		});
	});
});

describe("ptbr：蝶恋花游侠下的中奖信息", () => {
	describe("无 wpl 中奖信息", () => {
		it("wpl 数据为 null", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: null,
			});
			expect(ptbrInfo).toBeNull();
		});
		it("wpl 数据为 undefined", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: undefined,
			});
			expect(ptbrInfo).toBeNull();
		});
		it("wpl 数据为 空数组", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [],
			});
			expect(ptbrInfo).toBeNull();
		});
	});
	describe("存在 wpl 中奖信息", () => {
		it("swlb 数据为 null", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [3, 6, 11],
				swlb: null,
			});
			expect(ptbrInfo).toEqual([3, 6, 11]);
		});
		it("swlb 数据为 undefined", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [3, 6, 11],
				swlb: undefined,
			});
			expect(ptbrInfo).toEqual([3, 6, 11]);
		});
		it("swlb 数据为 空数组", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [3, 6, 11],
				swlb: [],
			});
			expect(ptbrInfo).toEqual([3, 6, 11]);
		});
		it("swlb 存在不能消失的百搭", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [3, 6, 11],
				swlb: [[6, 2]],
			});
			expect(ptbrInfo).toEqual([3, 11]);
		});
		it("swlb 存在可以消失的百搭", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [1, 5, 9, 13, 7, 15],
				swlb: [[7, 4]],
			});
			expect(ptbrInfo).toEqual([1, 5, 7, 9, 13, 15]);
		});
		it("swlb 即存在可消失的百搭数据又存在不可消失的百搭数据", () => {
			const ptbrInfo = slot.getPtbrV2({
				wpl: [1, 5, 9, 13, 7, 15],
				swlb: [
					[7, 4],
					[13, 2],
				],
			});
			expect(ptbrInfo).toEqual([1, 5, 7, 9, 15]);
		});
	});
});
