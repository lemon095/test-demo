import { expect, describe, it, beforeAll, test } from "bun:test";
import BaseChicky, { UserType } from "../chicky";

describe("随机车的位置: getRR", () => {
	const slot = new BaseChicky({
		cs: 1,
		ib: true,
		ml: 1,
		ps: 3,
		gmMul: {
			/**档位对应的倍率 */
			1: 1.92,
			2: 3.84,
			3: 7.68,
			4: 15.36,
			5: 30.72,
		},
	});
	it("验证是否为 1 或者 2", () => {
		expect([1, 2]).toContain(slot.getRR());
	});
	it("多次循环验证是否为 1 或者 2", () => {
		for (let i = 0; i < 100; i++) {
			expect([1, 2]).toContain(slot.getRR());
		}
	});
	const numTrials = 10000;
	const counts = { 1: 0, 2: 0, 0: 0 };
	const expectedProbability = 0.5; // 期望的概率是 0.5
	const tolerance = 0.1; // 允许的误差范围
	beforeAll(() => {
		for (let i = 0; i < numTrials; i++) {
			const result = slot.getRR();
			counts[result]++;
		}
	});
	it("验证 getRR 返回值的分布概率是否 1:1", () => {
		const total = numTrials;
		const probability1 = counts[1] / total;
		const probability2 = counts[2] / total;
		// 验证返回值的概率是否接近 0.5，允许一定的误差
		expect(probability1).toBeCloseTo(expectedProbability, tolerance);
		expect(probability2).toBeCloseTo(expectedProbability, tolerance);
	});
});

/**
 * 金币模式逻辑
 * ps == 3
 * ps == 4
 * ps == 1
 * ps == 2
 * this.prevWin
 * this.winnerPlay
 * this.currentWin
 * 争取没有任何问题....（除了RTP这块）
 */
