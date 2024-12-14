import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import {
	RL_WEIGHTS,
	TRL_WEIGHTS,
	FIXED_PRICE_ROUTES,
	ICON_MUL_MAP,
	CaiShenWins_ICON_MUL_MAP,
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
describe("固定中奖线： rwsp 中奖倍数", () => {
	it("rwsp: 3 连线中奖信息", () => {
		const wp: Record<string, number[]> = {
			"2": [1, 5, 9],
			"16": [1, 6, 9],
		};
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[6, 3, 4, 4, 5, 3, 0, 10, 4, 3, 7, 7, 3, 8, 8, 9, 4, 2, 3, 3],
					4
				),
				wp,
				winnerLineCount: keys(wp).reduce((acc, key) => {
					return {
						...acc,
						[key]: values(wp[key]).length,
					};
				}, {} as Record<string, number>),
			})
		).toEqual({
			"2": 20,
			16: 20,
		});
	});
	it("rwsp: 4 连线中奖信息", () => {
		const wp: Record<string, number[]> = {
			"7": [3, 7, 10, 15],
			"15": [2, 7, 10, 15],
			"19": [3, 7, 10, 13],
		};
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[7, 6, 8, 8, 2, 7, 7, 8, 6, 8, 8, 6, 5, 8, 5, 8, 3, 10, 5, 7],
					4
				),
				wp,
				winnerLineCount: keys(wp).reduce((acc, key) => {
					return {
						...acc,
						[key]: values(wp[key]).length,
					};
				}, {} as Record<string, number>),
			})
		).toEqual({
			"7": 10,
			"15": 10,
			"19": 10,
		});
	});
	it("rwsp: 5 连线中奖信息", () => {
		const wp: Record<string, number[]> = {
			"3": [3, 7, 11, 15, 19],
		};
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[7, 6, 1, 8, 2, 3, 4, 8, 6, 2, 3, 8, 5, 8, 5, 8, 3, 10, 5, 8],
					4
				),
				wp,
				winnerLineCount: keys(wp).reduce((acc, key) => {
					return {
						...acc,
						[key]: values(wp[key]).length,
					};
				}, {} as Record<string, number>),
			})
		).toEqual({
			"3": 50,
		});
	});
	it("rwsp: wp 为空", () => {
		const wp: Record<string, number[]> | null = null;
		expect(
			slot.getRwsp({
				iconMul: ICON_MUL_MAP,
				rl: chunk(
					[7, 6, 1, 8, 2, 3, 4, 8, 6, 2, 3, 8, 5, 8, 5, 8, 3, 10, 5, 8],
					4
				),
				winnerLineCount: keys(wp).reduce((acc, key) => {
					return {
						...acc,
						[key]: values(wp![key]).length,
					};
				}, {} as Record<string, number>),
			})
		).toBeNull();
	});
});
describe("相邻中奖线：rwsp 中奖倍数", () => {
	it("rwsp: 3 连线中奖信息", () => {
		expect(
			slot.getRwsp({
				iconMul: CaiShenWins_ICON_MUL_MAP,
				rl: chunk(
					[
						4, 8, 8, 1, 10, 4, 4, 11, 11, 12, 1, 10, 7, 4, 5, 10, 10, 10, 10,
						10, 8, 8, 8, 6, 6, 9, 5, 4, 11, 10,
					],
					5
				),
				wp: {
					"4": [0, 5, 6, 13],
				},
				winnerLineCount: {
					"4": 3,
				},
			})
		).toEqual({
			"4": 10,
		});
	});
});
