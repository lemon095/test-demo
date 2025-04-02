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
} from "utils/helper";
import Decimal from "decimal.js";

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
}
