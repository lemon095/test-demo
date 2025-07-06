import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";
import {
  after,
  chunk,
  cloneDeep,
  difference,
  flatMapDeep,
  flatten,
  flattenDeep,
  initial,
  isArray,
  isEmpty,
  isFunction,
  isNull,
  isNumber,
  isObject,
  keys,
  last,
  tail,
  toNumber,
  union,
  uniq,
  uniqBy,
  values,
} from "lodash";
import {
  TwCalculateType,
  RnsCalculateType,
  PcwcCalculateType,
  UserType,
} from "utils/helper";
import Decimal from "decimal.js";
import {
  FortuneMrHallowEggCount,
  FortuneMrHallowEggIconWeights,
} from "./TetWeights";

export default class ClassFeatSlot extends BaseSlot<any> {
  constructor(options: BaseSlotOptions<any>) {
    super(options);
  }

  public getRnsRl({
    rns,
    prevRl,
    rnsp,
    columnsLength,
    prevWinPos,
  }: {
    rns: number[][];
    rnsp: number[][];
    prevRl: number[];
    columnsLength: [number, number][];
    prevWinPos: number[];
  }) {
    const prevRlArr: number[][] = [];

    for (let colIndex = 0; colIndex < columnsLength.length; colIndex++) {
      const [start, end] = columnsLength[colIndex];
      const icons = prevRl.slice(start, end + 1);
      for (const pos of prevWinPos) {
        if (pos >= start && pos <= end) {
          icons.splice(pos - start, 1, -1);
        }
      }
      // 收集百搭的位置信息
      const zeroPoss: number[] = [];
      // 过滤掉百搭后的信息
      const newIcons = icons.filter((item, index) => {
        if (item === 0) {
          zeroPoss.push(index);
          return false;
        }
        return item;
      });
      // 收集删除的图标
      const negative = newIcons.filter((item) => item === -1);
      // 收集未被删除的图标
      const other = newIcons.filter((item) => item !== -1);
      // 合并删除和未删除
      const result = [...negative, ...other];
      zeroPoss.forEach((pos) => {
        // 插入百搭图标
        result.splice(pos, 0, 0);
      });
      prevRlArr.push(result);
    }
    rnsp.forEach((iconPoss, colIndex) => {
      const poss = isArray(iconPoss) ? iconPoss : [];
      const [start] = columnsLength[colIndex];
      poss.forEach((pos, posIndex) => {
        const icon = rns[colIndex][posIndex];
        prevRlArr[colIndex][pos - start] = icon;
      });
    });
    return prevRlArr;
  }
  /** 捣蛋鬼图标和图标位置信息 */
  public getEggIconInfo({ rl, mode }: { rl: number[][]; mode?: "noPrize" }) {
    const iconCountWeights = this.convertWeights(
      FortuneMrHallowEggCount[UserType.common]
    );
    const iconCountPos = random.int(0, iconCountWeights.length - 1);
    // 需要转换的图标数量
    const iconCount = iconCountWeights[iconCountPos];

    const iconWeights = this.convertWeights(
      FortuneMrHallowEggIconWeights[UserType.common]
    );
    const iconPos = random.int(0, iconWeights.length - 1);
    // 转换的图标
    const icon = iconWeights[iconPos];

    let targetCount = 0;

    const posList = flattenDeep(rl)
      .map((_icon, pos) => {
        // 捣蛋鬼强制不中奖逻辑
        if (mode && pos < 12) return 99;
        // 优化：在非强制不中奖下自己不转自己
        if (_icon === icon && !mode && targetCount < 12) {
          targetCount += 1;
          return 99;
        }
        return pos;
      })
      .filter((pos) => pos !== 99);

    // 收集捣蛋鬼图标位置信息
    const mergeIcons: Record<string, number> = {};
    for (let i = 0; i < iconCount; i++) {
      // 获取随机的位置信息
      const pos = random.int(0, posList.length - 1);
      // 从位置列表中拿到该位置信息
      const iconPos = posList[pos];
      // 删除已使用的位置
      posList.splice(pos, 1);
      mergeIcons[iconPos] = icon;
    }
    return mergeIcons;
  }
}
