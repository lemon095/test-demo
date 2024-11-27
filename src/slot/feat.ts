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
	values,
} from "lodash";
import {
	TwCalculateType,
	RnsCalculateType,
	PcwcCalculateType,
} from "utils/helper";
import Decimal from "decimal.js";

export default class ClassFeatSlot extends BaseSlot {
	constructor(options: BaseSlotOptions) {
		super(options);
	}

	/**
	 * pcwc 计算，暂未搞清楚该字段的含义
	 * @param {Object} options 配置参数
	 * @param {Object|null} options.wp 当前的中奖信息
	 * @param { PcwcCalculateType } options.mode 计算模式
	 * @param { PcwcCalculateType.Zero} options.mode.Zero 任何情况下都为 0
	 * @param { PcwcCalculateType.WinnerOne } options.mode.WinnerOne 只有收费中奖的情况下才为 1，否则 0
	 * @returns {number | void}
	 */
	public getPcwc({
		wp,
		mode,
	}: {
		wp?: Record<string, number[]> | null;
		mode: PcwcCalculateType;
	}): number | void {
		switch (mode) {
			case PcwcCalculateType.Zero:
				return 0;
			case PcwcCalculateType.WinnerOne:
				if (this.isPreWin) return 0;
				if (this.isDuoBaoPending) return 0;
				if (!isEmpty(wp)) return 1;
				return 0;
			default:
				return void 0;
		}
	}

	/**
	 * 在对应列中查找是否存在目标图标
	 * @param { Object } options - 配置项
	 * @param { number[] } options.icons - 当前列的图标信息
	 * @param { number } options.targetIcon - 目标图标
	 * @param { number } options.colLength - 列的长度
	 * @param { number } options.colIndex - 列的索引
	 * @param { number } options.baiDaIcon - 选填，百搭图标的 id。默认为 0
	 * @param { boolean } options.nullIcon - 选填，是否在返回值中用 null 填充信息，默认为 false 即不会使用 null 填充
	 * @returns { number[] } 图标对应的信息
	 */
	public static _findWinnerIconPosition<T extends boolean = false>({
		icons,
		targetIcon,
		colLength,
		colIndex,
		baiDaIcon = 0,
		nullIcon = false as T,
	}: {
		icons: number[];
		targetIcon: number;
		colLength: number;
		colIndex: number;
		baiDaIcon?: number;
		nullIcon?: boolean;
	}): T extends true ? (number | null)[] : number[] {
		const posInfo = [];
		for (let i = 0; i < icons.length; i++) {
			const icon = icons[i];
			// 当前图标是否为百搭
			const isCurrentBaiDa = icon === baiDaIcon;
			// 目标图标是否为百搭
			const isTargetBaiDa = targetIcon === baiDaIcon;
			if (icon === targetIcon || isCurrentBaiDa || isTargetBaiDa) {
				posInfo.push(i + colIndex * colLength);
			} else if (nullIcon) {
				posInfo.push(null);
			}
		}
		return posInfo as T extends true ? (number | null)[] : number[];
	}
	/**
	 * 相邻路中奖信息计算
	 * @param { Object } options - 配置信息
	 * @param { number[][] } options.rl - 随机结果
	 * @param { number[] } options.trl - 选填，头部随机的结果，默认为空数组
	 * @param { number } options.duobaoIcon - 选填，夺宝图标的 id。默认为 1
	 * @param { number } options.baiDaIcon - 选填，百搭图标的 id。默认为 0
	 * @param { number } options.winCount - 选填，最低中奖路径数量。默认为 3
	 * @returns { Object | null } 返回中奖信息
	 */
	public getAdjoinWp({
		rl,
		trl = [],
		duobaoIcon = 1,
		baiDaIcon = 0,
		winCount = 3,
	}: {
		rl: number[][];
		trl?: number[];
		duobaoIcon?: number;
		baiDaIcon?: number;
		winCount?: number;
	}): {
		wp: Record<string, number[]> | null;
		twp: Record<string, number[]> | null;
	} {
		const firstCol = rl[0];
		// 拿到列的长度
		const colLength = firstCol.length;
		// 拿到剩余列数据
		const cols = rl.slice(1);
		// 中奖信息
		const winnerPosition: Record<string, number[]> = {};
		const topWinnerPosition: Record<string, number[]> = {};
		// trl 是否成立
		const isHaveTrl = isArray(trl) && trl.length > 0;
		for (let i = 0; i < firstCol.length; i++) {
			const icon = firstCol[i];
			// 夺宝不能连线
			if (icon === duobaoIcon) {
				continue;
			}
			const trlWinnerPos = ClassFeatSlot._findWinnerIconPosition<true>({
				icons: trl,
				targetIcon: icon,
				// trl 的中奖位置是从 0 开始数，所以列长度和列索引都为 0
				colLength: 0,
				colIndex: 0,
				baiDaIcon,
				// null 填充信息
				nullIcon: true,
			});
			const winnerPos = cols.map((col, index) =>
				ClassFeatSlot._findWinnerIconPosition({
					icons: col,
					targetIcon: icon,
					colLength,
					// 因为从第二列开始截取，所以要加1
					colIndex: index + 1,
					baiDaIcon,
				})
			);
			const minWP = winnerPos.slice(0, winCount - 1);
			const notWinner = minWP.some((poss, index) => {
				// 不满足中奖条件，返回 true
				const flag1 = poss.length === 0;
				if (isHaveTrl) {
					return flag1 && isNull(trlWinnerPos[index]);
				}
				return flag1;
			});
			// 不满足最低中奖路径的条件，跳过当前循环
			if (notWinner) {
				continue;
			}
			// 已经出现最低中奖路径
			winnerPosition[icon] = [...(winnerPosition[icon] || []), i];
			if (isHaveTrl) {
				topWinnerPosition[icon] = [...(topWinnerPosition[icon] || [])];
			}
			minWP.forEach((poss, index) => {
				winnerPosition[icon].push(...poss);
				if (isNumber(trlWinnerPos[index])) {
					topWinnerPosition[icon].push(trlWinnerPos[index]);
				}
			});
			// 拿到剩余的列中奖信息
			const afterWP = winnerPos.slice(winCount - 1);
			const afterTrlIdx = winCount - 1;
			for (let j = 0; j < afterWP.length; j++) {
				const colWp = afterWP[j];
				const trlIcon = trlWinnerPos[afterTrlIdx + j];
				// 未中奖则退出当前循环
				if (colWp.length === 0 && isNull(trlIcon)) break;
				// 添加中奖信息
				winnerPosition[icon].push(...colWp);
				if (isNumber(trlIcon)) {
					topWinnerPosition[icon].push(trlIcon);
				}
			}
		}
		if (isEmpty(winnerPosition)) return { wp: null, twp: null };
		// 中奖路数据进行排序
		keys(winnerPosition).forEach((key) => {
			winnerPosition[key] = uniq(winnerPosition[key]).sort(function (a, b) {
				return a - b;
			});
		});
		return {
			wp: winnerPosition,
			twp: isHaveTrl ? topWinnerPosition : null,
		};
	}

	/**
	 * 获取 top rl 中奖的位置信息（去重）
	 * @param {Record<string, number[]>|null} twp - twp 中奖数据
	 * @returns {number[]|null} top rl 中奖的位置信息（去重）
	 */
	public getTptbr(twp?: Record<string, number[]> | null): number[] | null {
		if (isEmpty(twp)) return null;
		const tptbr = keys(twp).reduce((acc, key) => {
			return acc.concat(twp[key]);
		}, [] as number[]);
		return union(tptbr);
	}

	/**
	 * 计算中奖线路数
	 * @param {Object} options - 配置参数
	 * @param {Object|null} options.bwp - rl 的中奖位置信息
	 * @param {Object|null} options.twp - twp 的中奖位置信息
	 * @param {number} options.colLength - 列长度
	 * @param {number} options.rowLength - 行长度
	 * @returns {Object|null} 中奖线数量信息
	 */
	public getSnww({
		bwp,
		twp,
		colLength,
		rowLength,
	}: {
		twp?: Record<string, number[]> | null;
		bwp: Record<string, number[][]> | null;
		colLength: number;
		rowLength: number;
	}): Record<string, number> | null {
		if (isEmpty(bwp)) return null;
		const result: Record<string, number[]> = {};
		const wpKeys = keys(bwp);

		wpKeys.reduce((acc, iconId) => {
			const currentValue = bwp[iconId];
			const crrentTwp = twp?.[iconId] || [];
			acc[iconId] = [];

			// 先统计头部四个图标的中奖信息
			crrentTwp.forEach((pos) => {
				const colIndex = pos + 1;
				const count = acc[iconId][colIndex] || 0;
				acc[iconId][colIndex] = count + 1;
			});

			currentValue.forEach((item) => {
				const first = item[0];
				const last = item[item.length - 1];
				for (let rowIndex = 0; rowIndex < rowLength; rowIndex++) {
					// 计算每一列的起始索引
					const start = rowIndex * colLength;
					// 计算每一列的结束索引
					const end = start + colLength - 1;
					// 判断中奖位置在那一列，进行列的中奖次数统计
					if (first >= start && last <= end) {
						const count = acc[iconId][rowIndex] || 0;
						acc[iconId][rowIndex] = count + 1;
					}
				}
			});
			return acc;
		}, result);

		return keys(result).reduce((acc, iconId) => {
			acc[iconId] = result[iconId].reduce((count, nextCount) => {
				return count * nextCount;
			}, 1);
			return acc;
		}, {} as Record<string, number>);
	}

	/**
	 * 计算 ebb 中框的信息
	 */
	public getEbbBorderColor(info: PGSlot.Ebb, type: "金" | "银" | "普通") {
		switch (type) {
			case "金":
				return info.bt === 1 && info.ls === 1;
			case "银":
				return info.bt === 1 && info.ls === 2;
			case "普通":
				return info.bt === 2 && info.ls === 1;
		}
	}

	/**
	 * 中奖位置收集
	 * @param {Object} options - 配置参数
	 * @param {Object|null} options.bwp - rl 的中奖位置信息
	 * @param {Object|null} options.ebb - ebb 框合并的信息
	 * @param {number} options.mergeCount - 选填，框合并的数量（最小合并情况）。默认只为 2
	 * @param {Function} options.notVanishFn - 选填，不会消失的框的判断函数，默认为 银变金、金变百搭 不会消失
	 * @returns { {ptbr: number[]|null; ptbrp: number[]|null } } 中奖位置收集
	 */
	public getPtbr({
		bwp,
		ebb,
		mergeCount = 2,
		notVanishFn,
	}: {
		bwp?: Record<string, number[][]> | null;
		ebb?: Record<string, PGSlot.Ebb> | null;
		mergeCount?: number;
		notVanishFn?: (info: PGSlot.Ebb) => boolean;
	}) {
		const vanishHandler = isFunction(notVanishFn)
			? notVanishFn
			: (info: PGSlot.Ebb) => {
					// 银变金不消失
					if (this.getEbbBorderColor(info, "银")) return true;
					// 金变百搭 ptbrp
					if (this.getEbbBorderColor(info, "金")) return true;
					return false;
			  };
		if (isEmpty(bwp)) {
			return { ptbr: null, ptbrp: [] };
		}
		let ptbr: number[] = [];
		let ptbrp: number[] = [];
		const isEmptyEbb = isEmpty(ebb);
		if (isEmptyEbb) {
			values(bwp).forEach((posIndexs) => {
				ptbr.push(...flattenDeep(posIndexs));
			});
			return { ptbr: uniq(ptbr).sort((a, b) => a - b), ptbrp: null };
		}
		keys(bwp).forEach((item) => {
			bwp[item].forEach((posIndex) => {
				if (posIndex.length < mergeCount && isEmptyEbb) {
					// 放入ptbr
					ptbr.push(posIndex[0]);
					return;
				}
				//判断是否是银框& 金框 & 百搭
				const fp = posIndex[0];
				const lp = posIndex[posIndex.length - 1];
				keys(ebb).forEach((index) => {
					if (ebb[index].fp === fp && ebb[index].lp === lp) {
						if (vanishHandler(ebb[index])) {
							// 银变金 或 金变百搭 ptbrp
							ptbrp.push(...posIndex);
						} else {
							// 普通框 ptbr
							ptbr.push(...posIndex);
						}
					}
				});
			});
		});

		return {
			ptbr: uniq(ptbr).sort((a, b) => a - b),
			ptbrp: uniq(ptbrp).sort((a, b) => a - b),
		};
	}

	/**
	 * 计算总的中奖路数
	 * @param {number[]|null} nowpr - 每一列的单元格数量
	 * @returns {number} 总的中奖路数
	 */
	public getNow(nowpr?: number[] | null): number {
		if (isEmpty(nowpr) || !nowpr?.length) return 0;
		return nowpr.reduce((acc: number, crr: number) => {
			return acc * crr;
		}, 1);
	}

	/**
	 * 计算本局中有多少个单元格数量
	 * @description 鉴于目前一些游戏的 trl 都一样，所以 trl中的数据会默认当做 1 个单元格来计算，没有 trl信息，传入 0 即可
	 * @description 方法内部已根据 rl 数据自动获取到了 行长度和列长度信息。
	 * @description rl 收尾两列的图标默认不参与合并逻辑，所以每一个图标都算是一个单独的单元格
	 * @param {Object} options - 配置参数
	 * @param {Object} options.esb - 单元格合并的信息
	 * @param {number[][]} options.rl - 随机数信息
	 * @param {number} options.trlCellCount - 选填，trl 默认的单元格数量，默认为1，没有传入 0
	 * @returns {number[]} nowpr - 每一列的单元格数量
	 */
	public getNowpr({
		esb,
		rl,
		trlCellCount = 1,
	}: {
		esb: Record<string, number[]>;
		rl: number[][];
		trlCellCount?: number;
	}): number[] {
		const rowLength = rl.length;
		const colLength = rl[0].length;
		const result: number[] = [];
		for (let rowIndex = 0; rowIndex < rowLength; rowIndex++) {
			if (rowIndex === 0 || rowIndex === rowLength - 1) {
				result[rowIndex] = colLength;
			}
			result[rowIndex] = trlCellCount;
		}
		// 将 esb 的 value 信息拍成一维数组
		const esbValues = flatten(values(esb));
		// 转数组下标
		const rlArr = flatten(initial(tail(rl))).map((_, idx) => idx + colLength);
		// 对 rlArr数组中的内容做去重操作
		const filterRl = difference(rlArr, esbValues);

		// 先累加 rl 中未组合的情况
		filterRl.forEach((idx) => {
			// 跳过第一列和最后一列
			for (let rowIndex = 1; rowIndex < rowLength - 1; rowIndex++) {
				// 计算每一列的起始位置
				const start = rowIndex * colLength;
				// 每一列的结束位置
				const end = start + colLength - 1;
				if (idx >= start && idx <= end) {
					result[rowIndex] = result[rowIndex] + 1;
				}
			}
		});
		// 累加 esb 中组合图标的操作
		values(esb).forEach((item) => {
			const lastIdx = last(item) || -1;
			// 跳过第一列和最后一列
			for (let rowIndex = 1; rowIndex < rowLength - 1; rowIndex++) {
				// 计算每一列的起始位置
				const start = rowIndex * colLength;
				// 每一列的结束位置
				const end = start + colLength - 1;
				if (lastIdx >= start && lastIdx <= end) {
					result[rowIndex] = result[rowIndex] + 1;
				}
			}
		});
		return result;
	}

	/**
	 * 计算每框中每一个图标的位置信息 (获取 esb 和 es 信息)
	 * @description 这两个字段的输入和输出一致
	 * @param {Object} record - 框合并的信息
	 * @returns {Object} 合并框中的每一个图标位置信息
	 */
	public getEsbAndEs(
		record: Record<string, PGSlot.Ebb>
	): Record<string, number[]> {
		return keys(record).reduce((esb, crrKey) => {
			const pos = record[crrKey];
			const len = pos.lp - pos.fp;
			const posArr: number[] = [];
			for (let i = 0; i <= len; i++) {
				posArr.push(pos.fp + i);
			}
			return {
				...esb,
				[crrKey]: posArr,
			};
		}, {} as Record<string, number[]>);
	}

	/**
	 * 计算下一次框合并的信息
	 * @param {Object} options - 参数对象
	 * @param {Object|null} options.wp - 本局中的中奖信息
	 * @param {Object} options.ebb - 本局的框合并信息
	 * @param {Function} options.vanishFn - 选填，会消失框的判断函数，该函数默认普通框会消失。
	 * @returns {Object} eb - 下一次的框合并信息
	 */
	public getEb({
		wp,
		ebb,
		vanishFn,
	}: {
		wp?: Record<string, number[]>;
		ebb: Record<string, PGSlot.Ebb>;
		vanishFn?: (info: PGSlot.Ebb) => boolean;
	}): Record<string, PGSlot.Ebb> {
		if (isEmpty(wp)) return cloneDeep(ebb);
		const vanishHandler = isFunction(vanishFn)
			? vanishFn
			: (info: PGSlot.Ebb) => {
					// 默认普通框会消失
					if (this.getEbbBorderColor(info, "普通")) return true;
					return false;
			  };
		return keys(ebb).reduce((acc, crrKey) => {
			const ebbValue = ebb[crrKey];
			const wpValues = values(wp);
			const isHave = wpValues.some(
				(item) => item.includes(ebbValue.fp) && item.includes(ebbValue.lp)
			);
			// 中奖的情况
			if (isHave) {
				// 如果为普通框或者金框，并且 wp 中有该框的信息，则eb 中不包含 ebb 的信息
				if (vanishHandler(ebbValue)) {
					return acc;
				}
				// 非普通框的情况下，eb中包含 ebb 的框的信息
				return {
					...acc,
					[crrKey]: {
						...ebbValue,
					},
				};
			}
			// 不中奖的情况
			return {
				...acc,
				[crrKey]: ebbValue,
			};
		}, {} as Record<string, PGSlot.Ebb>);
	}
}
