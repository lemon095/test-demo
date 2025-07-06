import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { RL_WEIGHTS, TRL_WEIGHTS, MF_WEIGHTS } from "../TetWeights";
import { UserType } from "utils/helper";
import { keys, toNumber } from "lodash";

// describe("墨西哥: 中奖流程收集", () => {
//   const slot = new BaseSlot({
//     rlWeights: RL_WEIGHTS,
//     trlWeights: TRL_WEIGHTS,
//     cs: 0,
//     ml: 0,
//     prevSi: { wp: { 1: 1 } },
//   });
//   it("中奖数据信息", async () => {
//     // const testResult = await slot.collectSpinResult();
//     // expect(testResult).toHaveLength(6);
//     // expect(slot.diaoluoSi());
//     const si = slot.diaoluoSi();
//     console.log(si);
//   });
// });
