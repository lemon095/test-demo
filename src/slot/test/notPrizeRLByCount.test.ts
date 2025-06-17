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
  it("@rl随机5行6列", () => {
    const winnerIcons: number[] = [];
    for (let i = 0; i < 10000; i++) {
      const { rl } = slot.notPrizeRLByCount({
        iconIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        tableInfo: [5, 5, 5, 5, 5, 5],
        winnerCount: 8,
      });
      const countMap = new Map<number, number>();
      const iconsWithCount7: number[] = [];
      for (const icon of rl.flat()) {
        if (countMap.has(icon)) {
          const count = countMap.get(icon)!;
          const nextCount = count + 1;
          countMap.set(icon, nextCount);
          if (nextCount >= 8) {
            winnerIcons.push(icon);
          }
          if (nextCount === 7) {
            iconsWithCount7.push(icon);
          }
        } else {
          countMap.set(icon, 1);
        }
      }
      expect(winnerIcons).toHaveLength(0);
      expect(rl).toHaveLength(6);
    }
  });
});
