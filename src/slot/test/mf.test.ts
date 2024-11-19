import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, values } from "lodash";

const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 0,
	ml: 0,
});
describe("墨西哥: mf金框倍率信息", () => {
	it("根据不同的入参判断返回值是否为 object", () => {
		expect(slot.getMf({ gmTables: MF_WEIGHTS })).toBeObject();
		expect(slot.getMf({ gmTables: MF_WEIGHTS, gsp: [2, 5, 7] })).toBeObject();
		expect(slot.getMf({ gmTables: MF_WEIGHTS, prevMf: {} })).toBeObject();
		expect(
			slot.getMf({ gmTables: MF_WEIGHTS, prevMf: { 2: 0, 5: 0, 7: 2 } })
		).toBeObject();
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
		const len = slot.convertWeights(MF_WEIGHTS).length;
		for (let i = 0; i < len; i++) {
			const gms = values(slot.getMf({ gmTables: MF_WEIGHTS, gsp: [2, 5, 7] }));
			gms.forEach((gm) => {
				expect([0, 2, 3, 5, 10, 15, 20]).toContain(gm);
			});
		}
		for (let i = 0; i < len; i++) {
			const mfKeys = keys(slot.getMf({ gmTables: MF_WEIGHTS, gsp: [2, 5, 7] }));
			mfKeys.forEach((key) => {
				expect([2, 5, 7]).toContain(+key);
			});
		}
	});
});
