import { isEmpty, isNumber } from "lodash";
export default class BaseSlot {
  /** 是否连续15次未中奖 */
  public isNotWinOver15(count: number) {
    return count >= 15;
  }
  /** 上一次是否中奖 */
  public isPreWin(preWp?: Record<string, number[]> | null) {
    return !isEmpty(preWp);
  }

  /** 是否未夺宝流程 */
  public isDuoBaoPending({
    preFs,
    preWp,
  }: Partial<{
    preFs: Record<string, any> | null;
    preWp: Record<string, any> | null;
  }>) {
    if (isEmpty(preFs)) return false;
    const fs = preFs;
    // 如果上一次的 s === fs 并且上一次有中奖，则表示还未进夺宝流程
    if (fs?.s === fs?.ts && this.isPreWin(preWp)) return false;
    if (isNumber(fs?.s)) {
      // 上一次中奖... 那么当前就是 free game
      if (this.isPreWin(preWp)) return true;
      // 大于零，表示还有次数
      if (fs.s > 0) return true;
      // 如果上一次为 0，并且上一次未中奖，则表示当前这次位夺宝结束后的第一次
      if (fs.s === 0) return false;
    }
  }

  /** 是否为夺宝的最后一次 */
  public isLastDuoBao({
    currentWp,
    crrFs,
  }: {
    currentWp: Record<string, number[]>;
    crrFs: Record<string, any>;
  }): boolean {
    if (crrFs?.s === 0 && isEmpty(currentWp)) {
      return true;
    }
    return false;
  }
}
