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
describe("墨西哥狂欢： mf金框倍率信息", () => {
	it("获取随机倍率信息", () => {
		const mf = slot.getMf({ gsp: [2, 5, 7] });
		console.log("mf", mf);
		expect(mf).toBeObject();
	});
});
