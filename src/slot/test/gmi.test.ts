import { expect, describe, it } from "bun:test";
import BaseSlot from "../feat";
import {
  RL_WEIGHTS,
  TRL_WEIGHTS,
  FIXED_PRICE_ROUTES,
  ICON_MUL_MAP,
} from "../TetWeights";
import { UserType } from "utils/helper";
import { chunk, keys, values } from "lodash";

const slot = new BaseSlot({
  rlWeights: RL_WEIGHTS,
  trlWeights: TRL_WEIGHTS,
  userType: UserType.common,
  cs: 0.02,
  ml: 1,
});
describe("gmi 倍率列表的下标信息::蝶恋花", () => {
  it("累计中奖次数为 0", () => {
    const gml = slot.getGmi({
      cwc: 0,
      max: 3,
      min: 0,
    });
    expect(gml).toEqual(0);
  });
  it("累计中奖次数大于 0", () => {
    const gml = slot.getGmi({
      cwc: 3,
      max: 3,
      min: 0,
    });
    expect(gml).toEqual(2);
  });
  it("累计中奖次数大于最大值", () => {
    expect(
      slot.getGmi({
        cwc: 5,
        max: 3,
        min: 0,
      })
    ).toEqual(3);
    expect(
      slot.getGmi({
        cwc: 15,
        max: 3,
        min: 0,
      })
    ).toEqual(3);
  });
  it("累计中奖次数为 0但最小值为 1", () => {
    const gml = slot.getGmi({
      cwc: 0,
      max: 3,
      min: 1,
    });
    expect(gml).toEqual(1);
  });
  it("累计中奖次数小于最小值", () => {
    const gml = slot.getGmi({
      cwc: 1,
      max: 3,
      min: 2,
    });
    expect(gml).toEqual(2);
  });
});
