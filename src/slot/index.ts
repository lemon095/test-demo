import { Decimal } from "@prisma/client/runtime/library";
import {
  isNumber,
  isUndefined,
  cloneDeep,
  flatMapDeep,
  flatten,
  flattenDeep,
  isArray,
  isEmpty,
  isObject,
  keys,
  last,
  toNumber,
  union,
  values,
  chunk,
} from "lodash";
import random from "random";
import { TwCalculateType } from "utils/helper";
import RnsAdapter, { type RnsAdapterOptions } from "./RnsAdapter";

export interface BaseSlotOptions {
  /** rl 权重表配置 */
  rlWeights: PGSlot.RandomWeights;
  /** trl 权重表配置 */
  trlWeights?: PGSlot.RandomWeights;
  /** 用户类型 */
  userType: PGSlot.UserType;
  /** 上一局的信息 */
  prevSi?: Record<string, any>;
  /** 金额相关 */
  cs: number;
  /** 金额相关 */
  ml: number;
  /** 基准线 */
  lineRate?: number;
  /** 购买的夺宝模式 */
  isFb?: boolean;
  /** 用多少倍来购买的夺宝 */
  gmFb?: number;
}

export default class BaseSlot {
  /** rl的权重表 */
  private readonly rlWeightsMap: PGSlot.RandomWeights;
  /** trl的权重表 */
  private readonly trlWeightsMap?: PGSlot.RandomWeights;
  /** 上一局的游戏信息 */
  public readonly prevSi?: Record<string, any>;
  /** 用户信息 */
  public readonly userType: PGSlot.UserType;
  /** cs */
  public readonly cs: number;
  /** ml */
  public readonly ml: number;
  /** 基准线  */
  public readonly lineRate: number;
  /** 总下注 */
  public readonly totalBet: number;
  /** 阈值：多少次不赢，默认为 15 */
  public notWinnerTotal = 15;
  /** 累计多少次不赢，默认为 0 */
  public notWinnerCount = 0;
  public readonly isFb?: boolean;
  /**
   * base slot 构造器
   * @param {Object} options - 配置选项
   * @param {array} options.rlWeights 必填，rl的权重表
   * @param {array} options.trlWeights 必填，trl的权重表
   * @param {UserType} options.userType 必填，用户类型
   * @param {Object} options.prevSi 必填，上一次的 si
   * @param {number} options.cs 必填
   * @param {number} options.ml 必填
   * @param {number} options.lineRate 选填，基准线 默认 20
   */
  constructor({
    rlWeights,
    trlWeights,
    userType,
    prevSi,
    cs,
    ml,
    isFb,
    gmFb,
    lineRate = 20,
  }: BaseSlotOptions) {
    this.rlWeightsMap = rlWeights;
    this.trlWeightsMap = trlWeights;
    this.userType = userType;
    this.prevSi = prevSi;
    this.cs = cs;
    this.ml = ml;
    this.lineRate = lineRate;
    this.totalBet = new Decimal(cs).mul(ml).mul(lineRate).toNumber();
    if (isFb && gmFb) {
      this.totalBet = new Decimal(this.totalBet).mul(gmFb).toNumber();
      this.isFb = isFb;
    }
  }

  /** 当前是否为购买触发的夺宝 */
  public get isBuyDuoBao(): boolean {
    return this.isFb || false;
  }
  /**
   * rl 的权重表信息
   */
  public get rlTables(): number[][] {
    if (isUndefined(this.userType)) {
      throw new Error("请先设置用户类型");
    }
    return this.convertWeights(this.rlWeightsMap[this.userType]);
  }
  /**
   * trl 的权重表信息
   */
  public get trlTables(): number[][] {
    if (isUndefined(this.userType)) {
      throw new Error("请先设置用户类型");
    }
    if (isEmpty(this.trlWeightsMap)) {
      throw new Error("trlWeightsMap 为空");
    }
    return this.convertWeights(this.trlWeightsMap[this.userType]);
  }
  /**
   * 随机 rl 中的图标信息
   * @param weights - 权重表
   * @param count - 每一列的图标数量
   * @returns rl的随机信息
   */
  public randomRl(weights: number[][], count: number) {
    let result: number[][] = [];
    for (let i = 0; i < weights.length; i++) {
      const row: number[] = [];
      const colWeight = weights[i];
      for (let j = 0; j < count; j++) {
        const idx = random.int(0, colWeight.length - 1);
        row.push(colWeight[idx]);
      }
      result.push(row as number[]);
    }
    return result;
  }

  /**
   * 随机 trl 中的图标信息
   * @param weights - trl 的权重表
   * @returns trl的随机信息
   */
  public randomTrl(weights: number[][]) {
    let result: number[] = [];
    for (let i = 0; i < weights.length; i++) {
      const colWeight = weights[i];
      const idx = random.int(0, colWeight.length - 1);
      result.push(colWeight[idx]);
    }
    return result;
  }
  /**
   * 是否大于等于某个次数，默认值为 15
   * @param { number } this.notWinnerCount 当前次数
   * @param { number }this.notWinnerTotal 总数，默认值为 15
   * @return {boolean}
   */
  public get isNotWinOver15(): boolean {
    return this.notWinnerCount >= this.notWinnerTotal;
  }
  /**
   * 上一次是否中奖
   * @param preWp 上一次的 wp 信息
   */
  public get isPreWin(): boolean {
    return !isEmpty(this.prevSi?.wp);
  }

  /**
   * 是否为夺宝流程
   * @param {Object} options - 配置选项
   * @param {object} options.preFs - 上一次的 fs 信息
   * @param {object} options.preWp - 选填，上一次的 wp 信息
   * @returns {boolean|undefined} 是否为夺宝流程
   */
  public get isDuoBaoPending() {
    const { fs } = this.prevSi || {};
    if (isEmpty(fs)) return false;
    // 如果上一次的 s === fs 并且上一次有中奖，则表示还未进夺宝流程
    if (fs?.s === fs?.ts && this.isPreWin) return false;
    if (isNumber(fs?.s)) {
      // 上一次中奖... 那么当前就是 free game
      if (this.isPreWin) return true;
      // 大于零，表示还有次数
      if (fs.s > 0) return true;
      // 如果上一次为 0，并且上一次未中奖，则表示当前这次位夺宝结束后的第一次
      if (fs.s === 0) return false;
    }
    return false;
  }

  /**
   * 是否为夺宝的最后一次
   * @param {Object} options - 配置选项
   * @param {Object} options.currentWp - 当前的 wp 信息
   * @param {Object} options.crrFs - 当前的 fs 信息
   */
  public isLastDuoBao({
    currentWp,
    crrFs,
  }: {
    currentWp?: Record<string, number[]> | null;
    crrFs?: Record<string, any> | null;
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
   * @param {number} options.gmByIcon 必填，当前的倍数图标id信息 如果是图标id2对应倍数信息，那么给 2
   * @param {array} options.preTmd 上一次的 tmd 信息
   * @param {object} options.preTwp 上一次trl中的中奖信息
   * @param {array} options.trns 当前trl的掉落图标信息
   * @param {array} options.weights 倍数权重表
   * @returns {array} tmd 倍数信息
   */
  public getTmd({
    icons,
    gmByIcon,
    preTmd,
    preTwp,
    trns,
    weights,
  }: {
    icons: number[];
    gmByIcon: number;
    weights: number[];
    preTmd?: [number, number][] | null;
    preTwp?: Record<string, number[]> | null;
    trns?: number[] | null;
  }): [number, number][] | null {
    if (this.isPreWin) {
      // 掉落下的图标倍数信息
      // 获取删除的位置信息
      const delPoss = union(flatMapDeep(values(preTwp)));
      // 先修改 preTmd 的位置信息
      const currentTmd = preTmd?.map(([pos, tgm]) => {
        const len = delPoss.filter((delPos) => delPos < pos).length;
        return [pos - len, tgm];
      });
      // 再获取新生成的 图标位置信息
      const newTmd = trns!
        .map((icon, index) => {
          if (icon === gmByIcon) {
            return [
              icons.length - trns!.length + index,
              this.getRandomTgmByIcon(weights),
            ];
          }
          return null;
        })
        .filter((item) => item) as [number, number][];
      const result = [...(currentTmd || []), ...newTmd] as [number, number][];
      return isEmpty(result) ? null : result;
    }
    const newTmd = icons!
      .map((icon, index) => {
        if (icon === gmByIcon) {
          return [index, this.getRandomTgmByIcon(weights)];
        }
        return null;
      })
      .filter((item) => item) as [number, number][];
    return isEmpty(newTmd) ? null : newTmd;
  }

  /**
   * rl 中 md（图标倍数）的计算信息
   * @param {Object} options - 配置选项
   * @param {array} options.icons 必填，最新的rl图标信息
   * @param {number} options.gmByIcon 必填，当前的倍数图标id信息 如果是图标id2对应倍数信息，那么给 2
   * @param {array} options.preMd 上一次的 md 信息
   * @param {object} options.preBwp 上一次rl中的中奖信息
   * @param {object} options.rns 当前rl的掉落图标信息
   * @param {array} options.weights 倍数权重表集合，根据合并框的长度来取对应的权重表，key是框的长度，value是长度对应权重表
   * @param {number} options.colLength 每一列的长度
   * @param {object} options.ebb 当前每一列中的边框信息
   * @returns {array} md 倍数信息
   */
  public getMd({
    icons,
    gmByIcon,
    preMd,
    preBwp,
    rns,
    weights,
    ebb,
    colLength,
  }: {
    icons: number[][];
    gmByIcon: number;
    weights: Record<number, number[]>;
    colLength: number;
    ebb?: Record<string, { fp: number; lp: number; bt: number; ls: number }>;
    preMd?: [number, number][] | null;
    preBwp?: Record<string, number[][]> | null;
    rns?: number[][] | null;
  }): [number, number][] | null {
    // 非掉落下的图标倍数信息
    if (isEmpty(rns)) {
      let idx = 0;
      const ebbValues = values(ebb);
      const result = flatten(
        icons.map((col) => {
          const mds: [number, number][] = [];
          let breakCount = 0;
          for (let rowIndex = 0; rowIndex < col.length; rowIndex++) {
            const icon = col[rowIndex];
            if (icon === gmByIcon) {
              const bordered = ebbValues.find(({ fp, lp }) => {
                return idx >= fp && idx <= lp;
              });
              if (bordered) {
                if (breakCount <= 0) {
                  breakCount = bordered.lp - bordered.fp;
                  mds.push([
                    idx,
                    this.getRandomTgmByIcon(weights[breakCount + 1]),
                  ]);
                } else {
                  breakCount -= 1;
                }
              } else {
                mds.push([idx, this.getRandomTgmByIcon(weights[1])]);
              }
            }
            idx = idx + 1;
          }
          return mds.filter(isArray);
        })
      );
      return isEmpty(result) ? null : result;
    }
    if (isEmpty(preBwp)) {
      throw new Error("掉落流程下，上一次中奖信息不能为空");
    }
    // 掉落下的图标倍数信息
    // 1. 获取删除的图标位置，需要去重
    const delPoss = union(flatMapDeep(values(preBwp)));
    // 2. 根据删除的图标位置信息来更新 preMd 中的位置信息
    const currentMds = preMd?.map(([mdPos, gm]) => {
      // 获取移动的长度
      const moveLength = delPoss.filter((delPos) => {
        const delCol = Math.floor(delPos / colLength);
        const mdCol = Math.floor(mdPos / colLength);
        // 是否需要移动位置
        const isNeedMove = delPos > mdPos;
        // 是否为同一列
        const isEqualCol = delCol === mdCol;
        return isEqualCol && isNeedMove;
      }).length;
      const colIndex = Math.floor(mdPos / colLength);
      const colLastPos = colIndex * colLength + (colLength - 1);
      if (mdPos + moveLength > colLastPos) {
        throw new Error("超出边界");
      }
      return [mdPos + moveLength, gm];
    });
    // 3. 根据新生成的图标信息来生成新的图标倍数信息和索引位置
    // 这时候不需要考虑 ebb，因为掉落不会重新生成框信息
    const newMds = rns!
      .map((iconsByCol, colIndex) => {
        const basePos = colIndex * colLength;
        return flatten(
          iconsByCol
            .map((icon, index) => {
              // 新生成的图标会掉落在每一列的最前面
              // 那么新的 md position 计算只需要：每一列的基础位置 + 新生成的位置
              if (icon === gmByIcon) {
                return [basePos + index, this.getRandomTgmByIcon(weights[1])];
              }
              return null;
            })
            .filter(isArray)
        );
      })
      .filter((md) => md.length);
    const result = [...(currentMds || []), ...newMds].sort(
      (a, b) => a[0] - b[0]
    ) as [number, number][];
    return isEmpty(result) ? null : result;
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
   * 中奖金额
   * @param {Object} options - 配置选项
   * @param {Object} options.lw 本次的图标:图标对应中奖金额
   * @param {Object} options.wp 本次的中奖图标：对应索引位置
   * @param {number} options.oldAcw 上一次的中奖金额
   */
  public getAcw({
    lw,
    wp,
    oldAcw,
  }: {
    lw?: Record<string, number> | null;
    wp?: Record<string, number[]> | null;
    oldAcw: number;
  }): number {
    let amount = new Decimal(0);
    if (!this.isPreWin) {
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

  /**
   * 中奖金额
   * @param {Object} options - 配置选项
   * @param {Object} options.snww 选填，中奖线路数
   * @description 如果是存在中奖线路数的游戏，snww 必传。
   * @param {Object} options.rwsp 选填，中奖线图标倍率
   * @returns {Record<string, number>|null} 中奖的基础金额信息
   */
  public getLw({
    snww,
    rwsp,
  }: {
    snww?: Record<string, number> | null;
    rwsp?: Record<string, number> | null;
  }): Record<string, number> | null {
    if (isEmpty(rwsp)) {
      return null;
    }
    let lw: Record<number | string, number> = {};
    return keys(rwsp).reduce((acc, winId) => {
      const winCount = isEmpty(snww) ? 1 : snww[winId];
      return {
        ...acc,
        [winId]: new Decimal(this.totalBet)
          .div(this.lineRate)
          .mul(rwsp[winId])
          .mul(winCount)
          .toNumber(),
      };
    }, lw);
  }

  /**
   * 静态方法 计算本局中奖金额 - ctw
   * @description 使用静态方法是不想外部子类 改最基本的 ctw 的逻辑，因为其他方法也会调用这段逻辑
   * @returns { number } 中奖金额
   */
  public static _getCtw({
    lw,
    gm = 1,
  }: {
    lw?: Record<string, number> | null;
    gm?: number;
  }): number {
    if (isEmpty(lw)) return 0;
    const ctw = keys(lw).reduce((acc, key) => {
      return acc.add(lw[key]);
    }, new Decimal(0));
    return ctw.mul(gm).toNumber();
  }

  /**
   * 计算本局中奖金额 - ctw
   * @description 在某些场景下 tw = ctw，这时候 tw 通常会乘以本局的倍率信息
   * @description 在某些场景下 tw = 0，则 ctw 通常是 lw 中中奖图标的基础价格总计。在整个中奖流程中，掉落的最后一次通常会计算累计中奖金额乘以累计倍率信息，ctw = tw，不过也有其他例外的情况。
   * @description 目前几个游戏 ctw 基本都为 lw 中奖金额的总计 * 倍数。极速和墨西哥除外。
   * @description 那么在基础类目前只做最基本的逻辑运算，即静态方法 _getCtw 内实现的逻辑；如果 gm 没有则默认为 1
   * @param { Object } options - 配置信息
   * @param { Record<string, number> |null } options.lw - 选填，中奖图标的基础价值
   * @param { number } options.gm - 选填，图标的倍率信息，默认为 1
   * @returns { number } 中奖金额
   */
  public getCtw(params: {
    lw?: Record<string, number> | null;
    gm?: number;
  }): number {
    return BaseSlot._getCtw(params);
  }

  /**
   * 将权重配置转为权重表
   * @param {PGSlot.WeightCfg[][] | PGSlot.WeightCfg[]} weights - 权重配置信息
   * @returns { number[] | number[][] } 权重表数据
   */
  public convertWeights(weights: PGSlot.WeightCfg[]): number[];
  public convertWeights(weights: PGSlot.WeightCfg[][]): number[][];
  public convertWeights(
    weights: PGSlot.WeightCfg[][] | PGSlot.WeightCfg[]
  ): number[] | number[][] {
    if (isArray(weights[0])) {
      return (weights as PGSlot.WeightCfg[][]).map((item) =>
        flatten(item.map((weight) => Array(weight.weight).fill(weight.icon)))
      );
    }
    return flatten(
      (weights as PGSlot.WeightCfg[]).map((weight) =>
        Array(weight.weight).fill(weight.icon)
      )
    );
  }

  /**
   * 墨西哥狂欢：mf 金框倍率信息
   * @param {Object} options - 配置信息
   * @param {Array} options.gsp - 当前的金框信息
   * @param {Object} options.prevMf - 上一局的mf信息
   * @returns {Object} - 金框倍率信息
   */
  public getMf({
    gsp,
    prevMf,
    gmTables,
  }: {
    gmTables: { icon: number; weight: number }[];
    gsp?: number[];
    cgsp?: number[][];
    prevMf?: Record<string, number>;
  }): Record<string, number> {
    /**
     * mf:{
        "10": 3,
        "15": 0
      },
      pre "gsp": [
        10,
        15
      ],
      "gsp": [
        11,
        15
      ],
      "cgsp": [
        [
          10,
          11
        ]
      ]
     */
    const prevPos = keys(prevMf).map(toNumber);
    const currentPos = union(gsp, prevPos);
    return currentPos.reduce((acc, key) => {
      const gms = this.convertWeights(gmTables);
      const gmPos = random.int(0, gms.length - 1);
      const gm = prevMf?.[key] ?? gms[gmPos];
      return {
        ...acc,
        [key]: gm,
      };
    }, {} as Record<string, number>);
  }

  /**
   * 固定中奖路线的wp计算
   * @param { Object } options - 配置信息
   * @param { number[][] } options.fixedRoutes - 固定中奖路线
   * @param { number } options.duoBaoIcon - 选填，夺宝的图标 ID 信息
   * @param { number } options.baiDaIcon - 选填，百搭的图标 ID 信息
   * @param { number } options.baseCount - 选填，中奖路的最小数量，目前游戏都是 3 路起
   * @param {number[][]} options.rl - 图信息
   * @returns {Record<string, number[]>} - 中奖信息(wp)
   */
  public getFixedPriceWp({
    fixedRoutes,
    duoBaoIcon = 1,
    baiDaIcon = 0,
    baseCount = 3,
    rl,
  }: {
    fixedRoutes: number[][];
    rl: number[][];
    duoBaoIcon?: number;
    baiDaIcon?: number;
    baseCount?: number;
  }): Record<string, number[]> | null {
    // 需要考虑的条件：1. 夺宝不能中奖 2. 百搭可以搭配任意字符
    const wp = {};
    const colLength = rl[0].length;
    fixedRoutes.forEach((route, winId) => {
      let prevIcon = baiDaIcon;
      const posArr: number[] = [];
      // 待验证的 icon 列表
      const validIcons = route.map((iconPos, routeIndex) => {
        const col = rl[routeIndex];
        const icon = col[iconPos];
        return icon;
      });
      let len = validIcons.length;
      for (let i = 0; i < len; i++) {
        let icon = validIcons[i];
        if (icon === duoBaoIcon) break;
        // 如果当前 icon 是百搭，则把当前 icon 设置为上一次的 icon
        if (icon === baiDaIcon) {
          icon = prevIcon;
        }
        // 如果上一次 icon 是百搭，则把上一次的 icon 设置为当前 icon
        if (prevIcon === baiDaIcon) {
          prevIcon = icon;
        }
        if (icon === prevIcon) {
          const iconPos = route[i];
          prevIcon = icon;
          posArr.push(i * colLength + iconPos);
        } else {
          break;
        }
      }
      if (posArr.length >= baseCount) {
        Object.assign(wp, {
          [winId + 1]: posArr,
        });
      }
    });
    return isEmpty(wp) ? null : wp;
  }

  /**
   * 获取中奖路图标对应的倍率
   * @description 目前的游戏第一列不会出现百搭符号，如果有存在第一列有百搭符号的。那么 wp 和 rwsp 的计算都不适用
   * @param {Object} options - 参数对象
   * @param {Record<string, number[]>} options.wp - 图标的中奖信息
   * @param {Record<string, Record<number, number>>} options.iconMul - 图标对应的倍率信息
   * @param {number[][]} - 图标数组
   * @returns {Record<string, number>} 中奖图标对应的倍数
   */
  public getRwsp({
    wp,
    rl,
    iconMul,
  }: {
    wp?: Record<string, number[]> | null;
    rl: number[][];
    iconMul: Record<string, Record<number, number>>;
  }) {
    if (isEmpty(wp)) return null;
    const orl = flatten(rl);
    return keys(wp).reduce((acc, winId) => {
      const posArr = wp[winId];
      const pos = posArr[0];
      const icon = orl[pos];
      return {
        ...acc,
        [winId]: iconMul[icon][posArr.length],
      };
    }, {} as Record<string, number>);
  }

  /**
   * 通用 tw 计算
   * @description 目前接触到几个游戏中，tw 有两种计算方式，如果有累计倍数的逻辑则走 累计模式，否则走通用模式
   * @param {Object} options - 参数对象
   * @param {Object} options.lw - 本局中奖图标的基础金额
   * @param {Number} options.gm - 选填，本局倍率或者累计倍率，默认为 1
   * @param {Number} options.totalPrice - 选填，累计的总金额，只会在累计倍率的模式下使用，默认为 0
   * @param {Boolean} options.isCurrentWinner - 选填，当前是否中奖
   * @param {TwCalculateType} options.mode - tw 计算方式
   * @returns {Number} tw 金额
   */
  public getTw({
    lw,
    gm = 1,
    totalPrice = 0,
    isCurrentWinner,
    mode,
  }: {
    lw?: Record<string, number> | null;
    gm?: number;
    totalPrice?: number;
    isCurrentWinner?: boolean;
    mode: TwCalculateType;
  }): number {
    // 使用适配器设计模式思想用于处理复杂业务下的 tw 计算方式
    const twAdapter = {
      [TwCalculateType.TW通用]: (): number => {
        if (isEmpty(lw)) return 0;
        const ctw = BaseSlot._getCtw({ lw, gm });
        return new Decimal(gm).mul(ctw).toNumber();
      },
      [TwCalculateType.TW累计]: (): number => {
        // 如果上一次赢了，本次没赢（那么说明是掉落的最后一次），则直接返回累计金额 * 累计倍数
        if (this.isPreWin && !isCurrentWinner) {
          return new Decimal(totalPrice).mul(gm).toNumber();
        }
        // 否则直接返回 0
        return 0;
      },
    }[mode];
    return twAdapter();
  }

  /**
   * 墨西哥：ssaw 计算逻辑
   * @param {Object} options - 参数对象
   * @param {Object} options.lw - 本局中奖图标的基础金额
   * @param {number} options.gm - 选填，本局倍率，默认为 1
   */
  public getSsawBy1492288({
    lw,
    gm = 1,
  }: {
    lw?: Record<string, number> | null;
    gm?: number;
  }) {
    const prevSsaw = this.prevSi?.ssaw || 0;
    const ctw = BaseSlot._getCtw({ lw, gm });
    return new Decimal(ctw).add(prevSsaw).toNumber();
  }

  /**
   * 墨西哥：aw 计算
   * @param {Object} options - 参数对象
   * @param {number} options.tw - 当前的 tw 金额
   * @returns {number} 累计的中奖接你
   */
  public getAwBy1492288({ tw }: { tw: number }) {
    if (this.isDuoBaoPending) {
      const prevAw = this.prevSi?.aw || 0;
      return new Decimal(prevAw).add(tw).toNumber();
    }
    return tw;
  }
  /**
   * 判断夺宝的数量
   * @description 有些游戏的每一列图标是会合并的。所以需要用到合并框的信息（ebb）
   * @description 有些游戏会跳过某一行的信息，比如墨西哥。那么需要传入跳过行的信息
   * @param {Object} options - 参数对象
   * @param {number[][]} options.rl - 下方图信息
   * @param {number[]} options.trl - 选填，上方图信息。如果不填则是空数组
   * @param {Record<string, number[]>} options.esb - 选填，如果存在图标合并成框的信息，那么需要用到这个参数
   * @param {number} options.duobaoIcon - 选填，夺宝图标的id，默认为 1
   * @param {number} options.skipRow - 选填，需要跳过的行数 (从 1 开始数)
   * @returns {number} 夺宝图标的数量
   */
  public getSc({
    rl,
    trl = [],
    duobaoIcon = 1,
    esb = {},
    skipRow = 0,
  }: {
    rl: number[][];
    trl?: number[];
    esb?: Record<string, number[]> | null;
    duobaoIcon?: number;
    skipRow?: number;
  }): number {
    if (!isArray(trl) || !isArray(rl))
      throw new Error("trl 或 rl 参数数据格式错误");
    if (!isObject(esb)) throw new Error("esb 参数数据格式错误");
    const esbValues = values(esb);
    const colLength = rl[0].length;
    const _rl = flatMapDeep([...rl]);
    let count = trl.reduce((acc, crrIcon) => {
      if (crrIcon === duobaoIcon) {
        return acc + 1;
      }
      return acc;
    }, 0);
    for (let iconPos = 0; iconPos < _rl.length; iconPos++) {
      // 需要跳过某个位置的图标，比如墨西哥需要跳过第一行的图标信息
      const skipPos = skipRow * (iconPos / colLength);
      if (skipRow && new Decimal(skipPos).isInt()) {
        continue;
      }
      if (_rl[iconPos] !== 1) {
        continue;
      }
      const duobaos = esbValues.filter((idxArr) =>
        idxArr.some((pos) => pos === iconPos)
      );
      if (duobaos.length) {
        for (let d = 0; d < duobaos.length; d++) {
          const lastIdx = last(duobaos[d]) || -1;
          if (lastIdx !== iconPos) {
            continue;
          }
          count += 1;
        }
      } else {
        count += 1;
      }
    }
    return count;
  }

  /**
   * 获取下一局游戏状态
   * @param {Object} options - 参数对象
   * @param {number} options.sc - 夺宝数量
   * @param {Object} options.fs - 夺宝模式下的数据
   * @param {Object} options.currentWp - 当前中奖图标信息
   * @returns {number} 当前游戏状态 1|4|21|22
   */
  public getNst({
    sc = 0,
    fs,
    currentWp,
  }: {
    currentWp?: Record<string, any> | null;
    sc?: number;
    fs?: Record<string, any> | null;
  }): number {
    if (this.isDuoBaoPending) {
      // 当前为夺宝的最后一次
      if (this.isLastDuoBao({ crrFs: fs, currentWp })) return 1;
      // 当前未中奖
      if (isEmpty(currentWp)) return 21;
      // 当前中奖
      return 22;
    }
    if (sc > 3 && isEmpty(currentWp)) return 21;
    if (isEmpty(currentWp)) return 1;
    return 4;
  }
  /**
   * 获取当前局游戏状态
   * @returns {number} 当前游戏状态 1|4|21|22
   */
  public getSt() {
    return this.prevSi?.nst ?? 1;
  }

  /** 当局游戏的原始 rl 数据 */
  public orl(rl: number[][]) {
    return flattenDeep(cloneDeep(rl));
  }

  /** tbb 每一局的投注额 */
  public get tbb(): number {
    return this.totalBet;
  }

  /** tb 本局的投注额 free game 模式下为 0 */
  public get tb(): number {
    if (this.isPreWin) return 0;
    if (this.isDuoBaoPending) return 0;
    return this.totalBet;
  }

  /**
   * 当前盈利
   * @param { number } tw 盈利金额
   */
  public getNp(tw: number): number {
    if (this.isDuoBaoPending) {
      return tw;
    }
    if (this.isPreWin) {
      return tw;
    }
    return new Decimal(tw).minus(this.totalBet).toNumber();
  }

  /**
   * 通用逻辑：cwc 中奖流程中的累计次数
   * @param {Object} wp - 中奖图标信息
   * @returns {number} 中奖流程中的累计次数
   */
  public getCwc(wp?: Record<string, any> | null) {
    let cwc = 0;
    const isWin = !isEmpty(wp);
    if (isWin) {
      cwc = 1;
      if (this.isPreWin) {
        cwc += this.prevSi?.cwc || 0;
      }
    }
    return cwc;
  }

  /**
   * 获取 gwt
   * @description 位置含义的参数，所以计算逻辑只是按照当初的理解来写的
   * @param {number} aw - aw
   */
  public getGwt(aw: number) {
    let gwt = -1;
    const gwtDiff = aw / this.tbb;
    if (gwtDiff > 0 && gwtDiff < 5) {
      gwt = 1;
    } else if (gwtDiff >= 5 && gwtDiff < 15) {
      gwt = 2;
    } else if (gwtDiff >= 15 && gwtDiff < 35) {
      gwt = 3;
    } else if (gwtDiff > 35) {
      gwt = 4;
    }
    return gwt;
  }

  /**
   * 墨西哥：get ir
   * @returns {boolean} 中奖时为 true，未中奖为 false
   */
  public getIr() {
    return this.isPreWin;
  }

  /**
   * 墨西哥 ptr: 获取非金框下的数值
   * @param {Object} options - 参数对象
   * @param {number[]} options.gsp - 金框位置
   * @param {Object} options.wp - 当前中奖图标信息
   * @return {number[]|null} 非金框下的数值
   */
  public getPtrBy1492288({
    wp,
    gsp,
  }: {
    gsp: number[];
    wp?: Record<string, any> | null;
  }): number[] | null {
    if (isEmpty(wp)) return null;
    const innerWp = cloneDeep(wp);
    const wpValues = flattenDeep(values(innerWp));
    return union(wpValues.filter((v) => !gsp.includes(v)));
  }

  /**
   * 墨西哥 wsp: 获取金框下的数值
   * @param {Object} options - 参数对象
   * @param {number[]} options.gsp - 金框位置
   * @param {Object} options.wp - 当前中奖图标信息
   * @returns {number | null} 获取金框下的数值
   */
  public getWspBy1492288({
    gsp,
    wp,
  }: {
    gsp: number[];
    wp?: Record<string, number[]> | null;
  }): number[] | null {
    if (isEmpty(wp)) return null;
    const innerWp = cloneDeep(wp);
    const wpValues = flattenDeep(values(innerWp));
    return wpValues.filter((v) => gsp.includes(v));
  }

  /**
   * 墨西哥：ge 计算
   * @description 不是通用的计算方式
   * @param {Object} options - 配置项
   * @param {Object|null} options.wp - 中奖图标信息
   * @param {Object|null} options.wsp - 中奖图标的金框位置
   * @param {Object|null} options.mf - 金框对应的倍率信息
   * @param {number} options.st - 当前游戏的模式
   * @return {number[]} 游戏模式信息
   */
  public getGeBy1492288({
    wsp,
    mf,
    st,
    wp,
  }: {
    st: number;
    wp?: Record<string, number[]> | null;
    wsp?: number[] | null;
    mf?: Record<string, number> | null;
  }): number[] {
    const ge = [11];
    // 是否存在消除的金框倍率信息
    const isGlod = wsp?.some((pos) => (mf?.[pos] ?? 0) > 0);
    const isCurrentWinner = !isEmpty(wp);
    const prevGlod: boolean = this.prevSi?.ge?.some(
      (item: number) => item === 3
    );
    // 夺宝模式
    if (st > 4) {
      if (isGlod || prevGlod) {
        ge.push(3);
      }
      if (isCurrentWinner) {
        ge.push(1);
      } else {
        ge.push(2);
      }
      return union(ge).sort((a, b) => a - b);
    }
    // 非夺宝模式
    ge.push(1);
    if (isGlod || (this.isPreWin && prevGlod)) {
      ge.push(3);
    }
    return union(ge).sort((a, b) => a - b);
  }

  /**
   * 通用 ge 计算方式
   * @param {number} st 当前游戏的模式信息
   * @returns {number[]} 当前游戏的模式信息
   */
  public getGe(st: number): number[] {
    if (st > 4) {
      return [2, 11];
    }
    return [1, 11];
  }

  /**
   * 通用：fstc 游戏模式的累计中奖信息
   * @returns {Object|null}
   */
  public getFstc(): Record<string, number> | null {
    const prevFstc = this.prevSi?.fstc || {};
    // 处理夺宝流程
    if (this.isDuoBaoPending) {
      const prev22 = prevFstc[22] || 0;
      const prev21 = prevFstc[21] || 0;
      return {
        ...prevFstc,
        21: prev21 + (this.isPreWin ? 0 : 1),
        22: prev22 + (this.isPreWin ? 1 : 0),
      };
    }
    // 处理非夺宝流程
    if (this.isPreWin) {
      const prev4 = prevFstc[4] || 0;
      return {
        4: prev4 + 1,
      };
    }
    return null;
  }

  /**
   * 墨西哥：倍率处理
   * @param {number} cgm - 本局的倍率信息，没有则为 0
   * @returns {number} 默认为 1 倍
   */
  public getGmBy1492288(cgm: number) {
    if (this.isDuoBaoPending) {
      const prevGm = this.prevSi?.gm;
      return cgm + prevGm || 1;
    }
    const prevGm = this.isPreWin ? this.prevSi?.gm || 0 : 0;
    return cgm + prevGm || 1;
  }

  /**
   * 通用：获取夺宝模式下的基础信息
   * @param {Object} options - 配置项
   * @param {number} options.sc - 夺宝数量
   * @param {number} options.scRadix - 夺宝基数
   * @param {number} options.scGm - 选填，减去夺宝基础后，没多一个夺宝需要多加几次免费游戏次数，默认为 1
   * @param {number} options.playCount - 选填，夺宝模式下，起步的免费游玩次数，默认 0
   * @param {number} options.tw 本局中奖金额
   * @returns {Object | null}
   */
  public getFs({
    sc,
    scRadix,
    scGm = 1,
    playCount = 0,
    tw,
  }: {
    sc: number;
    scRadix: number;
    tw: number;
    scGm?: number;
    playCount?: number;
  }): { s: number; ts: number; aw: number } | null {
    // 触发夺宝
    if (sc > 3) {
      // 计算当前夺宝流程下的次数
      const currentS = (sc - scRadix) * scGm + playCount;
      return {
        s: currentS,
        ts: currentS,
        aw: 0,
      };
    }
    // 如果是夺宝流程
    if (this.isDuoBaoPending) {
      const prevFs = this.prevSi?.fs as { s: number; ts: number; aw: number };
      const aw = new Decimal(tw).add(prevFs.aw).toNumber();
      if (this.isPreWin) {
        return {
          ...prevFs,
          // 只统计夺宝流程下的中奖金额，免费掉落的夺宝也是一样的
          aw,
        };
      }
      return {
        ...prevFs,
        s: prevFs.s - 1,
        aw,
      };
    }
    return null;
  }
  /** 获取 tb，free game 的情况下是 0 */
  public getTb() {
    if (this.isPreWin) return 0;
    if (this.isDuoBaoPending) return 0;
    return this.totalBet;
  }

  /** 计算 rns 掉落 */
  public getRns(params: RnsAdapterOptions) {
    const rns = new RnsAdapter(params);
    return rns;
  }

  /**
   * gsp 金框图标对应的索引位置信息
   * @param {Object} options -配置信息
   * @param {Array|null} options.cgsp 本次金框元素下落位置信息
   * @param {Array|null} options.ngsp 掉落出现的金框元素位置信息
   * @param {Number} options.rate 金框的概率
   * @param {Array} options.preGsp 上一次的金框信息
   */
  public getGsp({
    rl,
    cgsp,
    ngsp,
    preGsp,
    rate,
  }: {
    rl: number[][];
    cgsp: number[][] | null;
    ngsp: number[] | null;
    preGsp: number[];
    rate: number[];
  }): number[] {
    let gspResult: number[] = [];
    if (ngsp != null) {
      gspResult.push(...ngsp);
    }
    if (!this.isPreWin) {
      rl.forEach((value, index) => {
        value.forEach((item, itemIndex) => {
          const pos = value.length * index + itemIndex;
          const randomNumber = Math.random() * 100;
          if (randomNumber < rate[index] && item != 0 && item != 1) {
            gspResult.push(pos);
          }
        });
      });
      return gspResult;
    }

    if (isEmpty(cgsp) || cgsp === null) {
      gspResult.push(...preGsp);
      return gspResult;
    }

    let cgspList: number[] = [];
    let f: Record<number, number> = {};
    cgsp.forEach((c) => {
      cgspList.push(c[0]);
      f[c[0]] = c[1];
    });

    preGsp.forEach((g) => {
      if (cgspList.includes(g)) {
        gspResult.push(f[g]);
      }
    });
    return gspResult;
  }

  /**
   * cgsp 金框元素下落信息
   *@param {Object} options - 配置信息
   *@param {Array} options.preGsp
   *@param {Array} options.prePtr
   *@param {Number} options.colLength
   */
  public getCgsp({
    preOrl,
    preGsp,
    prePtr,
    colLength,
  }: {
    preOrl: number[];
    preGsp: number[];
    prePtr: number[];
    colLength: number;
  }): number[][] | null {
    if (!this.isPreWin || preGsp.length === 0) {
      return null;
    }
    const newpreOrl = chunk(preOrl, colLength);
    let cgsp: number[][] = [];
    newpreOrl.forEach((item, index) => {
      preGsp.forEach((value) => {
        const posStart = item.length * index;
        const posEnd = item.length - 1 + index * colLength;
        if (posStart <= value && posEnd >= value && preOrl[value] != 0) {
          let posi = 0;
          prePtr.forEach((p) => {
            if (p > value && p <= posEnd) {
              posi += 1;
            }
          });
          if (posi > 0) {
            cgsp.push([value, value + posi]);
          }
        }
      });
    });

    return cgsp;
  }

  /**
   * ngsp 掉落出现的金框索引位置
   * @param {Object} options -配置信息
   * @param {Array} options.gsp 金框或金框变百搭元素的位置
   */
  public getNgsp({
    rns,
    rate,
    colLength,
  }: {
    rns: number[][] | null;
    rate: number[];
    colLength: number;
  }): number[] | null {
    if (!this.isPreWin || rns === null) {
      return null;
    }
    let gspResult: number[] = [];

    rns.forEach((item, index) => {
      item.forEach((i, iIndex) => {
        const pos = colLength * index + iIndex;
        const randomNumber = Math.random() * 100;
        if (randomNumber < rate[index] && i != 0 && i != 1) {
          gspResult.push(pos);
        }
      });
    });

    return gspResult;
  }

  /**
   * getCgm 本轮消除金框对应的倍率和
   * @param {Object} options -配置信息
   * @param {Array} options.wsp 本轮的消除金框位置
   * @param {Object} options.mf 金框元素位置对应的倍率
   */
  public getCgm({
    wsp,
    mf,
  }: {
    wsp: number[] | null;
    mf: Record<string, number>;
  }): number {
    if (isEmpty(wsp)) {
      return 0;
    }
    let cgm: number = 0;
    wsp?.forEach((value) => {
      const key = value.toString();
      if (mf.hasOwnProperty(key)) {
        cgm += mf[key];
      }
    });
    return cgm;
  }
}
