import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
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
describe("wpl: 存在wp中奖信息", () => {
	it("wp 存在多个中奖信息：", () => {
		const wpl = slot.getWpl({
			"2": [1, 5, 9],
			"20": [1, 7, 9, 15],
		});
		expect(wpl).toEqual([1, 5, 7, 9, 15]);
	});
	it("wp 存在一个中奖信息", () => {
		const wpl = slot.getWpl({
			"20": [1, 7, 9, 15],
		});
		expect(wpl).toEqual([1, 7, 9, 15]);
	});
});

describe("wpl: 不存在wp中奖信息", () => {
	it("wp为 null 的情况", () => {
		const wpl = slot.getWpl(null);
		expect(wpl).toBeNull();
	});
	it("wp 为 undefined 的情况", () => {
		const wpl = slot.getWpl(void 0);
		expect(wpl).toBeNull();
	});
	it("wp 为 空对象的情况", () => {
		const wpl = slot.getWpl({} as unknown as any);
		expect(wpl).toBeNull();
	});
});
