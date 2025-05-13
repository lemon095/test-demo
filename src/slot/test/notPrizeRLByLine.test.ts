import { expect, describe, it } from "bun:test";
import BaseSlot from "../index";
import { chunk, flattenDeep } from "lodash";
import { RL_WEIGHTS, TRL_WEIGHTS } from "slot/TetWeights";
import { UserType } from "utils/helper";
const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
  userType: UserType.common,
  cs: 0,
  ml: 0,
});
describe("@强制不中奖的图标随机信息", () => {
  it("@rl随机4行5列", () => {
    for (let i = 0; i < 10000; i++) {
      const { rl, trl } = slot.notPrizeRLByLine({
        iconIds: [2, 3, 4, 5, 6, 7, 8, 9],
        count: [4, 4, 4, 4, 4],
      });
      const firstColumn = rl[0];
      const secondColumn = [...rl[1], ...rl[2], ...trl.slice(0, 2)];
      const intersection = secondColumn.filter((item) =>
        firstColumn.includes(item)
      );
      expect(intersection).toHaveLength(0);
    }
  });
});
