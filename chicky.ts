import Decimal from "decimal.js";
import {
  flatMapDeep,
  flatten,
  isArray,
  isEmpty,
  isNumber,
  isUndefined,
  keys,
  union,
  values,
} from "lodash";
import random from "random";

export enum UserType {
  /** 试玩 */
  trail = 0,
  /** 新用户 */
  newuser = 1,
  /** 正常用户 */
  common = 2,
}

export default class BaseChicky {
  /**
   * @ib true: 金币模式; false: 普通模式
   * @ps 表示状态 1,2表示操作阶段，3表示继续/开始游戏，4表示领取
   */
  public gcc({
    ib,
    ps,
    isWin,
  }: {
    ib: boolean;
    ps: number;
    isWin: boolean;
  }): number {
    if (!ib || ps === 3 || ps === 4 || !isWin) {
      return 0;
    }
    //根据概率随机
    const confProbability: Record<number, number> = {
      0: 22,
      1: 59,
      2: 18,
      3: 1,
    };
    let Data: Record<number, number> = {};
    let totalProbability = 0;
    for (const key in confProbability) {
      totalProbability += confProbability[key];
      Data[key] = totalProbability;
    }
    const randNum = random.int(1, 100);
    for (const key in Data) {
      if (randNum < Data[key]) {
        return Number(key);
      }
    }

    return 0;
  }
  public testFn() {
    return "test";
  }
  /**
   * 随机车的位置
   * @returns {number} 左二右一
   */
  public getRR(): 1 | 2 {
    const r = random.int(1, 2);
    return r as 1 | 2;
  }
}
