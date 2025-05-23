import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, FIXED_PRICE_ROUTES } from "../TetWeights";
import { UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 0,
	ml: 0,
});
describe("固定中奖路线WP", () => {
	// 1 2 3 4 5 6,18 7,19 8 9 10 11 12 13 14 15 16 17 20
	// 14 17
	it("验证三连的中奖路线", () => {
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[6, 3, 4, 4, 5, 3, 0, 10, 4, 3, 7, 7, 3, 8, 8, 9, 4, 2, 3, 3],
					4
				),
			})
		).toEqual({
			wp: {
				"2": [1, 5, 9],
				"16": [1, 6, 9],
			},
			winnerLineCount: {
				2: 3,
				16: 3,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[4, 3, 5, 6, 3, 5, 5, 10, 3, 5, 7, 7, 3, 8, 8, 9, 4, 2, 3, 3],
					4
				),
			})
		).toEqual({
			wp: {
				"9": [2, 5, 9],
				"12": [2, 6, 9],
			},
			winnerLineCount: {
				9: 3,
				12: 3,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[8, 5, 5, 6, 10, 10, 5, 6, 5, 8, 5, 5, 10, 8, 8, 6, 10, 8, 7, 6],
					4
				),
			})
		).toEqual({
			wp: {
				"1": [2, 6, 10],
				"4": [1, 6, 11],
				"10": [1, 6, 10],
				"13": [2, 6, 11],
			},
			winnerLineCount: {
				1: 3,
				4: 3,
				10: 3,
				13: 3,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[6, 6, 8, 6, 4, 10, 10, 6, 8, 6, 5, 8, 10, 8, 8, 6, 10, 8, 7, 6],
					4
				),
			})
		).toEqual({
			wp: {
				"20": [1, 7, 9, 15],
			},
			winnerLineCount: {
				20: 4,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[8, 5, 6, 5, 5, 0, 0, 6, 5, 7, 5, 7, 4, 2, 9, 10, 4, 3, 2, 10],
					4
				),
			})
		).toEqual({
			wp: {
				"6": [1, 5, 10],
				"10": [1, 6, 10],
				"11": [3, 6, 10],
				"18": [1, 5, 10],
			},
			winnerLineCount: {
				"6": 3,
				"10": 3,
				"11": 3,
				"18": 3,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[8, 6, 8, 6, 8, 6, 0, 6, 5, 6, 7, 7, 4, 2, 9, 10, 4, 3, 2, 10],
					4
				),
			})
		).toEqual({
			wp: {
				"2": [1, 5, 9],
				"5": [3, 6, 9],
				"16": [1, 6, 9],
				"20": [1, 7, 9],
			},
			winnerLineCount: {
				"2": 3,
				"5": 3,
				"16": 3,
				"20": 3,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[9, 5, 4, 10, 10, 2, 9, 4, 4, 5, 5, 4, 5, 4, 10, 5, 5, 10, 5, 6],
					4
				),
			})
		).toEqual({
			wp: {
				"8": [2, 7, 11],
			},
			winnerLineCount: {
				8: 3,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[7, 6, 8, 8, 2, 7, 7, 8, 6, 8, 8, 6, 5, 8, 5, 8, 3, 10, 5, 7],
					4
				),
			})
		).toEqual({
			wp: {
				"7": [3, 7, 10, 15],
				"15": [2, 7, 10, 15],
				"19": [3, 7, 10, 13],
			},
			winnerLineCount: {
				7: 4,
				15: 4,
				19: 4,
			},
		});
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[7, 6, 1, 8, 2, 3, 4, 8, 6, 2, 3, 8, 5, 8, 5, 8, 3, 10, 5, 8],
					4
				),
			})
		).toEqual({
			wp: {
				"3": [3, 7, 11, 15, 19],
			},
			winnerLineCount: {
				3: 5,
			},
		});
	});
	it("验证夺宝开头的情况", () => {
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[8, 1, 1, 6, 10, 10, 1, 6, 5, 8, 1, 1, 10, 8, 8, 6, 10, 8, 7, 6],
					4
				),
			})
		).toEqual({ wp: null, winnerLineCount: null });
	});
	it("验证百搭开头的情况", () => {
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[8, 0, 0, 6, 10, 10, 5, 6, 5, 8, 5, 5, 10, 8, 8, 6, 10, 8, 7, 6],
					4
				),
			})
		).toEqual({
			wp: {
				"1": [2, 6, 10],
				"4": [1, 6, 11],
				"10": [1, 6, 10],
				"13": [2, 6, 11],
			},
			winnerLineCount: {
				"1": 3,
				"4": 3,
				"10": 3,
				"13": 3,
			},
		});
	});
	it("验证所有的五连线信息", () => {
		const winnerPosition = FIXED_PRICE_ROUTES.reduce((acc, route, index) => {
			return {
				...acc,
				[index + 1]: route.map((pos, index) => index * 4 + pos),
			};
		}, {} as Record<string, number[]>);
		const winnerLineCount = keys(winnerPosition).reduce((acc, winId) => {
			return {
				...acc,
				[winId]: winnerPosition[winId].length,
			};
		}, {} as Record<string, number>);
		expect(
			slot.getFixedPriceWp({
				fixedRoutes: FIXED_PRICE_ROUTES,
				rl: chunk(
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					4
				),
			})
		).toEqual({
			wp: winnerPosition,
			winnerLineCount,
		});
	});
});
