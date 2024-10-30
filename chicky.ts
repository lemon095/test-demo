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

/** 用户类型 */
export enum UserType {
  /** 试玩 */
  trail = 0,
  /** 新用户 */
  newuser = 1,
  /** 正常用户 */
  common = 2,
}

/** 用户操作 */
export enum GameOperate {
  /** 小鸡在左侧 */
  left = 1,
  /** 小鸡在右侧 */
  right = 2,
  /** 开始游戏 */
  start_play = 3,
  /** 游戏胜利/领奖 */
  winner_paly = 4,
}

/** 车（物体）的位置 */
export enum CarPos {
  /** 车在左侧 */
  left = 2,
  /** 车在右侧 */
  right = 1,
  /** 暂无状态  */
  None = 0,
}

export interface BaseChickyParams {
  /** 用户行为 */
  ps: GameOperate;
  /** 金币模式信息 */
  ib: boolean;
  /** 投注额 */
  cs: number;
  /** 投注线 */
  ml: number;
  prevSi?: Record<string, any>;
}

export const ChickyMultiple: Record<number, number> = {
  /**档位对应的倍率 */
  1: 1.92,
  2: 3.84,
  3: 7.68,
  4: 15.36,
  5: 30.72,
};

export default class BaseChicky {
  public readonly ps: GameOperate;
  public readonly ib: boolean;
  public readonly cs: number;
  public readonly ml: number;
  public readonly totalBet: number;
  public readonly prevSi?: Record<string, any>;

  /**
   * base Chicky 构造器
   * @param {Object} options - 配置选项
   * @param {GameOperate} options.ps 必填，用户的操作信息
   * @param {boolean} options.ib 必填，是否为金币模式
   * @param {boolean} options.cs 必填，投注额
   * @param {boolean} options.ml 必填，投注线
   * @param {Record<string, any>} options.prevSi 可选，上次游戏信息
   */
  constructor({ ps, ib, cs, ml, prevSi }: BaseChickyParams) {
    this.ps = ps;
    this.ib = ib;
    this.cs = cs;
    this.ml = ml;
    this.prevSi = prevSi;
    this.totalBet = new Decimal(cs).mul(ml).toNumber();
  }
  /**
   * @ib true: 金币模式; false: 普通模式
   * @ps 表示状态 1,2表示操作阶段，3表示继续/开始游戏，4表示领取
   */
  public gcc({ isWin }: { isWin: boolean }): number {
    if (!this.ib || this.ps === 3 || this.ps === 4 || !isWin) {
      return 0;
    }
    //根据概率随机
    const randNum = random.int(1, 100);
    const result = this.convertWeights([
      { icon: 0, weight: 22 },
      { icon: 1, weight: 59 },
      { icon: 2, weight: 18 },
      { icon: 3, weight: 1 },
    ]);
    return result[randNum];
  }

  /**
   * agcc 累计金币的数量
   * @param {Object} options - 配置选项
   * @param {number} options.gcc 本次金币的数量
   * @param {number} options.preAgcc 上一次累计的金币数量
   */
  public getAgcc({ gcc, preAgcc }: { gcc: number; preAgcc: number }): number {
    if (!this.ib || this.ps === GameOperate.start_play) {
      return 0;
    }

    return preAgcc + gcc;
  }

  /**
   * agcv 收集的金币金额
   *
   * @param {number} agcc 金币的总数量
   */
  public getAgcv(agcc: number): number {
    const agcv = new Decimal(agcc).mul(this.totalBet).mul(0.5).toNumber();
    return agcv;
  }
  /**
   * 上一局是否赢
   * @returns {boolean} true:赢，false:输
   */
  public get isPrevWin(): boolean {
    return this.isCurrentWin(this.prevSi?.rr, this.prevSi?.ps);
  }

  /**
   * gcv 本次金币的金额
   * @param {Object} options - 配置选项
   * @param {number} options.gcc 本次金币的数量
   * @param {number} options.sgcv 每一枚金币的价值
   */
  public getGcv({ gcc, sgcv }: { gcc: number; sgcv: number }): number {
    if (!this.ib) {
      return 0;
    }
    const gcvCount = new Decimal(sgcv).mul(gcc).toNumber();
    return gcvCount;
  }

  /**
   * getSgcv 每一枚金币的价值
   */
  public getSgcv(): number {
    if (!this.ib) {
      return 0;
    }
    const amount = new Decimal(this.totalBet).mul(0.5).toNumber();

    return amount;
  }

  /**
   *
   */
  /**
   * getGmi 倍率
   * @param {number} cfc 游戏状态
   */
  public getGmi(cfc: number): number {
    const preGmi = this.prevSi?.["gmi"] || 0;
    if (cfc === 1) {
      const preGmi = this.prevSi?.["gmi"] || 0;
      return ChickyMultiple[preGmi + 1];
    }
    if (preGmi === 0) return 0;
    return ChickyMultiple[preGmi];
  }

  /**
   * getCfc 游戏状态
   * @param {boolean} isCurrentWin 本次是否中
   */
  public getCfc(isCurrentWin: boolean): number {
    if (
      isCurrentWin &&
      (this.ps === GameOperate.left || this.ps === GameOperate.right)
    ) {
      return 1;
    }
    return 0;
  }

  /**
   * 是否为金币模式
   * @returns {boolean} true:金币模式，false:非金币模式
   */
  public get isGlod(): boolean {
    return this.ib;
  }

  public testFn() {
    const result = this.convertWeights([
      { icon: 0, weight: 22 },
      { icon: 1, weight: 59 },
      { icon: 2, weight: 18 },
      { icon: 3, weight: 1 },
    ]);
    console.log(result);
    return "test";
  }

  /**
   * 本局是否输赢
   * @param {CarPos} 车的位置
   * @param {GameOperate} 小鸡的位置，选填。不填则为当局游戏的小鸡位置
   * @returns {boolean} true:赢，false:输
   */
  public isCurrentWin(carPos: CarPos, ps = this.ps): boolean {
    if (ps === GameOperate.left && carPos === CarPos.left) return true;
    if (ps === GameOperate.right && carPos === CarPos.right) return true;
    if (ps == GameOperate.winner_paly && this.isPrevWin) return true;
    return false;
  }

  /**
   * 随机车的位置
   * @returns {CarPos} 左二右一
   */
  public getRR(): CarPos {
    if (this.isPrevWin) return CarPos.None;
    const r = random.int(CarPos.right, CarPos.left);
    return r;
  }
  /**
   * 将权重配置转为权重表
   * @param {PGSlot.WeightCfg[]} weights - 权重配置信息
   * @returns 权重表数据
   */
  public convertWeights(weights: PGSlot.WeightCfg[]): number[] {
    return flatMapDeep(
      weights.map((item) => Array(item.weight).fill(item.icon))
    );
  }

  /**
   * 当前是否为购买
   * @returns {boolean} true:是，false:否
   */
  public get isBuyPlay() {
    return this.ps === GameOperate.start_play;
  }

  /**
   * 获取 cr
   * @returns {number} count
   */
  public getCr(): number {
    return this.prevSi?.nr || 1;
  }

  /**
   * 获取 nr
   * @returns {number} count
   */
  public getNr(carPos: CarPos): number {
    // 游戏购买则为 1
    if (this.isBuyPlay) return 1;
    /** 游戏失败则为 0 */
    if (!this.isCurrentWin(carPos, this.ps)) return 0;
    /** 游戏领取则为 0 */
    if (this.ps === GameOperate.winner_paly) return 0;
    return (this.prevSi?.cr || 1) + 1;
  }

  /**
   * 获取 acfc
   * @returns { number } count
   */
  public getAcfc(carPos: CarPos) {
    // 购买时为 0
    if (this.isBuyPlay) return 0;
    // 游戏失败 则为上一次的值
    if (!this.isCurrentWin(carPos, this.ps)) return this.prevSi?.acfc || 0;
    // 游戏领取则为上一次的值
    if (this.ps === GameOperate.winner_paly) return this.prevSi?.acfc || 0;
    // 累加
    return (this.prevSi?.acfc || 0) + 1;
  }

  /**
   * 获取小鸡的位置信息
   * @returns {Array<number>} 小鸡的位置信息
   */
  public getArr(): number[] {
    const prevArr: number[] = this.prevSi?.arr || [];
    if (this.isBuyPlay || this.ps === GameOperate.winner_paly) {
      return isEmpty(prevArr) ? Array(10).fill(0) : prevArr;
    }
    const prevPos = prevArr.filter((item) => item > 0);
    const currentPos = [...prevPos, this.ps];
    const count = Math.min(10, Math.max(10 - currentPos.length, 0));
    return [...currentPos, ...Array(count).fill(0)];
  }

  /**
   * 获取 nst 的值
   * @returns {number} 1: 输 2: 赢
   */
  public getNst(carPos: CarPos) {
    if (this.isBuyPlay) return 2;
    if (this.ps === GameOperate.winner_paly) return 1;
    if (this.isCurrentWin(carPos, this.ps)) return 2;
    return 1;
  }

  /**
   * 获取 st 的值
   */
  public getSt() {
    return this.prevSi?.nst || 1;
  }

  /**
   * 获取 ge
   * @returns {Array<number>}
   */
  public getGe() {
    if (this.isGlod) return [3, 11];
    return [1, 11];
  }
}
