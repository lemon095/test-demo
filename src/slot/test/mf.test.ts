import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS } from "../TetWeights";
import { UserType } from "../../chicky";

const slot = new BaseSlot({
	rlWeights: RL_WEIGHTS,
	trlWeights: TRL_WEIGHTS,
	userType: UserType.common,
	cs: 0,
	ml: 0,
});
describe("墨西哥: mf金框倍率信息", () => {
	it("根据不同的入参判断返回值是否为 object", () => {
		expect(slot.getMf({})).toBeObject();
		expect(slot.getMf({ gsp: [2, 5, 7] })).toBeObject();
		expect(slot.getMf({ prevMf: {} })).toBeObject();
		expect(slot.getMf({ prevMf: { 2: 0, 5: 0, 7: 2 } })).toBeObject();
	});
	it("prev mf 和 gsp 索引相同，判断值是否为 prev mf 的值", () => {
		expect(
			slot.getMf({ prevMf: { 2: 0, 5: 0, 7: 2 }, gsp: [2, 5, 7] })
		).toEqual({
			2: 0,
			5: 0,
			7: 2,
		});
	});
	it("不存在 prev mf, 判断当前的 mf 的倍率信息是否正确", () => {
		expect(slot.getMf({ gsp: [2, 5, 7] }));
	});
});
