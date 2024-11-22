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
describe("墨西哥: mf金框倍率信息", () => {
	it("根据不同的入参判断返回值是否为 object", () => {
		expect(slot.getMf({ gmTables: MF_WEIGHTS })).toEqual({});
		expect(
			slot.getMf({ gmTables: MF_WEIGHTS, prevMf: { 2: 0, 5: 0, 7: 2 } })
		).toEqual({});
	});
	it("验证mf 的 key 是否为给定 gsp 的 值", () => {
		const mf = slot.getMf({ gmTables: MF_WEIGHTS, gsp: [2, 5, 7] });
		expect(keys(mf).map(toNumber)).toEqual([2, 5, 7]);
	});
	it("prev mf 和 gsp 索引相同，判断值是否为 prev mf 的值", () => {
		expect(
			slot.getMf({
				gmTables: MF_WEIGHTS,
				prevMf: { 2: 0, 5: 0, 7: 2 },
				gsp: [2, 5, 7],
			})
		).toEqual({
			2: 0,
			5: 0,
			7: 2,
		});
	});
	it("不存在 prev mf, 判断当前的 mf 的倍率信息是否正确", () => {
		const gsp = [2, 5, 7];
		for (let i = 0; i < 1000; i++) {
			const mf = slot.getMf({ gmTables: MF_WEIGHTS, gsp });
			for (let j = 0; j < gsp.length; j++) {
				const key = gsp[j];
				expect(Object.keys(mf).length).toEqual(gsp.length);
				expect([0, 2, 3, 5, 10, 15, 20]).toContain(mf[key]);
			}
		}
	});
	it("金框位置存在掉落，验证当前的 mf 信息是否正确", () => {
		const mf = slot.getMf({
			gmTables: MF_WEIGHTS,
			gsp: [11, 15],
			cgsp: [[10, 11]],
			prevMf: {
				"10": 3,
				"15": 0,
			},
		});
		expect(mf).toEqual({ 11: 3, 15: 0 });
	});
	it("金框位置存在掉落并且 gsp 新增金框位置信息验证当前的 mf 信息是否正确", () => {
		const gsp = [11, 15, 17];
		const mf = slot.getMf({
			gmTables: MF_WEIGHTS,
			gsp: gsp,
			cgsp: [[10, 11]],
			prevMf: {
				"10": 3,
				"15": 0,
			},
		});
		// 验证 keys 是否相等
		expect(keys(mf).map(toNumber)).toEqual([11, 15, 17]);
		// 验证倍率是否是这几个值
		for (let j = 0; j < 1000; j++) {
			expect([0, 2, 3, 5, 10, 15, 20]).toContain(mf[17]);
		}
		// 验证 发生 fallMf 以及 prevMf 的信息是否正确
		expect(mf[11]).toEqual(3);
		expect(mf[15]).toEqual(0);
	});
	// it("mf 问题数据", () => {
	// 	const gsp = [8, 14];
	// 	const mf = slot.getMf({
	// 		gmTables: MF_WEIGHTS,
	// 		gsp: gsp,
	// 		cgsp: null,
	// 		prevMf: {},
	// 	});
	// 	expect(mf).toEqual({});
	// });
});
