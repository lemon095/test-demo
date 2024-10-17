import Decimal from "decimal.js";
import { flatMapDeep, isArray, isEmpty, isNumber, keys, values } from "lodash";
import random from "random";
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

  /**
   * trl 中 tmd（图标倍数）的计算信息
   * @param {Object} options - 配置选项
   * @param {array} options.icons 必填，最新的trl图标信息
   * @param {number} options.tgmByIcon 必填，当前图标id 如果图标id 2 对应倍数信息，那么给id 2
   * @param {array} [options.preTmd] 上一次的 tmd 信息
   * @param {object} [options.twp] 当前trl中的中间信息
   * @param {array} [options.trns] 当前trl的掉落图标信息
   * @param {array} [options.tgmWeight] 倍数权重表
   * @returns {array} tmd 倍数信息
   */
  public getTmd({
    icons,
    tgmByIcon,
    preTmd,
    twp,
    trns,
    tgmWeight,
  }: {
    icons: number[];
    tgmByIcon: number;
    preTmd?: [number, number][];
    twp?: Record<string, number[]>;
    trns?: number[];
    tgmWeight: number[];
  }): [number, number][] {
    if (!isEmpty(twp) && !isEmpty(preTmd) && !isEmpty(trns)) {
      // 掉落下的图标倍数信息
      // 获取删除的位置信息
      const delPoss = flatMapDeep(values(twp));
      // 先修改 preTmd 的位置信息
      const currentTmd = preTmd!.map(([pos, tgm]) => {
        const len = delPoss.filter((delPos) => delPos < pos).length;
        return [pos - len, tgm];
      }) as [number, number][];
      // 再获取新生成的 图标位置信息
      const newTmd = trns!
        .map((icon, index) => {
          if (icon === tgmByIcon) {
            return [
              icons.length - trns!.length + index,
              this.getRandomTgmByIcon(tgmWeight),
            ];
          }
          return null;
        })
        .filter((item) => item) as [number, number][];
      return [...currentTmd!, ...newTmd];
    }
    const newTmd = icons!
      .map((icon, index) => {
        if (icon === tgmByIcon) {
          return [index, this.getRandomTgmByIcon(tgmWeight)];
        }
        return null;
      })
      .filter((item) => item) as [number, number][];
    return newTmd;
  }

  /**
   * 随机图标的倍数
   * @param tgms 倍数权重表
   * @returns tgm 倍数信息
   */
  public getRandomTgmByIcon(tgms: number[]) {
    const tgm = random.int(0, tgms.length - 1);
    return tgms[tgm];
  }

  /**
   *
   * @param lw: 本次的图标:图标对应中奖金额
   * @param wp: 本次的中奖图标：对应索引位置
   * @param wp: 本次的中奖图标：对应索引位置
   * @param oldAcw: 上一次的中奖金额
   */
  public getAcw({
    lw,
    wp,
    oldWp,
    oldAcw,
  }: {
    lw?: Record<string, number> | null;
    oldWp?: Record<string, number[]> | null;
    wp?: Record<string, number[]> | null;
    oldAcw: number;
  }): number {
    let amount = new Decimal(0);
    if (this.isPreWin(oldWp)) {
      //上一次没有中奖的情况下，本次为收费或消耗次数
      if (isEmpty(wp) || isEmpty(lw)) {
        //本次也没有中
        return amount.toNumber();
      }
      //本次中奖 acw 为本次的金额
      keys(lw).forEach((key) => {
        amount = amount.add(lw[key]);
      });
      return amount.toNumber();
    }
    //本次为免费的情况下
    if (isEmpty(wp) || isEmpty(lw)) {
      return oldAcw;
    }

    //免费并且本次中奖的情况下
    keys(lw).forEach((key) => {
      amount = amount.add(lw[key]);
    });
    amount = amount.add(oldAcw);

    return amount.toNumber();
  }
}
