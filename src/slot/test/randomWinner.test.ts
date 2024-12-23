import { expect, describe, it, beforeAll } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { RnsCalculateType, UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";
const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 100,
	ml: 100,
	lineRate: 0.5,
});

describe("相邻中奖，rs esst 掉落信息", () => {
	it("默认不传，则永远都不会中奖 （weight 小于 最小值）", () => {
		for (let i = 0; i < 1000; i++) {
			const isWinner = slot.randomWinner({});
			expect(isWinner).toBeFalsy();
		}
	});
	it("输入 weight 大于最大值，则永远不中奖", () => {
		for (let i = 0; i < 1000; i++) {
			const isWinner = slot.randomWinner({ weight: 101 });
			expect(isWinner).toBeFalsy();
		}
	});
	it("min、 max、weight 都是 100，则永远中奖", () => {
		for (let i = 0; i < 1000; i++) {
			const isWinner = slot.randomWinner({ weight: 100, min: 100, max: 100 });
			expect(isWinner).toBeTruthy();
		}
	});
	it("min、 max、weight 都是 0，则永远中奖", () => {
		for (let i = 0; i < 1000; i++) {
			const isWinner = slot.randomWinner({ weight: 0, min: 0, max: 0 });
			expect(isWinner).toBeTruthy();
		}
	});
	const numTrials = 10000;
	const counts = { true: 0, false: 0 };
	const expectedProbability = 0.5; // 期望的概率是 0.5
	const tolerance = 0.1; // 允许的误差范围
	beforeAll(() => {
		for (let i = 0; i < numTrials; i++) {
			const isWinner = slot.randomWinner({ weight: 50 });
			if (isWinner) {
				counts.true++;
			} else {
				counts.false++;
			}
		}
	});
	it("weight 是 max 的一半，则 50% 的中奖概率", () => {
		const total = numTrials;
		const probability1 = counts.true / total;
		const probability2 = counts.false / total;
		// 验证返回值的概率是否接近 0.5，允许一定的误差
		expect(probability1).toBeCloseTo(expectedProbability, tolerance);
		expect(probability2).toBeCloseTo(expectedProbability, tolerance);
		expect(counts.true + counts.false).toBe(numTrials);
	});
});
