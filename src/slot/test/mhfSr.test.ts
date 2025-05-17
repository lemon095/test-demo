import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import { chunk, flattenDeep, keys, values } from "lodash";
import { RL_WEIGHTS, TRL_WEIGHTS } from "slot/TetWeights";
import { UserType } from "utils/helper";
const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
  userType: UserType.common,
  cs: 0,
  ml: 0,
});
describe("@rl中图标转换", () => {
  describe("@非强制不中奖", () => {
    it("@转换的位置信息是否重复、越界&图标是否为1个或越界", () => {
      const rl = [
        [5, 7, 2, 2],
        [2, 2, 2, 3],
        [5, 4, 4, 4],
        [6, 4, 4, 4],
        [4, 4, 4, 5],
      ];
      for (let i = 0; i < 1000; i++) {
        const sr = slot.getEggIconInfo({
          rl,
        });
        const poss = keys(sr).map((pos) => +pos);
        const unionPoss = new Set(poss);

        // 验证图标位置信息是否重复，长度不相等则表示有重复位置
        expect(unionPoss.size).toBe(poss.length);
        // 验证图标位置信息是否越界
        expect(poss.some((pos) => pos > 19 || pos < 0)).toBe(false);
        // 验证图标位置数量是否小于最小值5
        expect(unionPoss.size).toBeGreaterThan(4);
        // 验证图标位置数量是否大于最大值8
        expect(unionPoss.size).toBeLessThan(9);

        // 验证转换的图标是否为一个
        const icons = values(sr);
        const unionIcons = new Set(icons);
        // 验证图标是否只有一个
        expect(unionIcons.size).toBe(1);
        // 验证图标是否越界
        expect([2, 3, 4, 5].includes([...unionIcons][0])).toBe(true);
      }
    });
  });
  describe("@强制不中奖", () => {
    it("@转换的位置信息是否重复或越界", () => {
      const rl = [
        [2, 3, 4, 5],
        [2, 3, 4, 5],
        [2, 3, 4, 5],
        [6, 4, 4, 4],
        [4, 4, 4, 5],
      ];
      for (let i = 0; i < 1000; i++) {
        const sr = slot.getEggIconInfo({
          rl,
          mode: "noPrize",
        });
        const poss = keys(sr).map((pos) => +pos);
        // 验证图标位置信息是否越界
        expect(poss.some((pos) => pos > 19 || pos < 12)).toBe(false);
      }
    });
  });
});
