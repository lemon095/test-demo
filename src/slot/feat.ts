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
	public getEbbBorderColor({ bt, ls }: PGSlot.Ebb, type: "金" | "银" | "普通") {
		switch (type) {
			case "金":
				return bt === 1 && ls === 1;
			case "银":
				return bt === 1 && ls === 2;
			case "普通":
				return bt === 2 && ls === 1;
			default:
				return false;
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

	/**
	 * 计算当前框合并信息（ebb）
	 * @param {Object} options - 配置参数
	 * @param {Object|null} options.rs - 掉落的信息
	 * @param {number[][]} options.rl - 随机数信息
	 * @param {number[][]} options.mergeWeights - 框合并的权重表
	 * @param {number[]} options.iconIds - 排除百搭和夺宝图标 id的其他都有图标 id
	 * @param {number} options.maxCountByDuobao - 选填，夺宝最多占据几格，默认最多占据两格
	 * @param {number} options.buyCountByDuoBao - 选填，购买夺宝的个数，默认为4
	 * @param {number} options.duobaoIcon - 选填，夺宝图标 id，默认为 1
	 * @param {number} options.baiDaIcon - 选填，百搭图标 id，默认为 0
	 * @param {number} options.maxCountByBaiDa - 选填，百搭最多占据几格，默认最多占据两格
	 * @param {Object} options.silverWeights - 银框权重表
	 * @returns {Object} - 返回 Ebb 信息
	 */
	public getEbb({
		rl,
		rs,
		mergeWeights,
		maxCountByDuobao = 2,
		buyCountByDuoBao = 4,
		maxCountByBaiDa = 2,
		duobaoIcon = 1,
		baiDaIcon = 0,
		iconIds,
		silverWeights,
	}: {
		rl: number[][];
		rs?: PGSlot.RS | null;
		silverWeights?: Record<string, (0 | 1)[]>;
		mergeWeights: number[][];
		maxCountByDuobao?: number;
		buyCountByDuoBao?: number;
		duobaoIcon?: number;
		baiDaIcon?: number;
		maxCountByBaiDa?: number;
		iconIds: number[];
	}): [Record<string, PGSlot.Ebb>, number[][]] {
		if (this.isPreWin) {
			if (isEmpty(rs)) {
				throw new Error("rs is null in prewin");
			}
			if (isEmpty(this.prevSi?.eb)) {
				throw new Error("eb is null in prewin");
			}
			const ebb = cloneDeep(this.prevSi!.eb);
			// 如果 esst 没有信息，则不会进行框的颜色变更操作. 比如极速游戏
			keys(rs.esst || {}).forEach((keyIdx) => {
				const isBaiDa = rs.esst[keyIdx].ns === baiDaIcon;
				const bt = isBaiDa ? 2 : 1;
				const ls = isBaiDa ? 1 : 1;
				ebb[keyIdx] = {
					...ebb[keyIdx],
					bt,
					ls,
				};
			});
			keys(rs.espt).forEach((keyIdx) => {
				ebb[keyIdx].fp = rs.espt[keyIdx].np[0];
				ebb[keyIdx].lp = rs.espt[keyIdx].np[1];
			});
			return [ebb, rl];
		}
		const rowLength = rl.length;
		const colLength = rl[0].length;
		const info: number[][] = [];
		const newRl = flattenDeep(rl);
		const prePosResult = this.getEbbPosition({
			rl: newRl,
			rowLength,
			colLength,
			weights: mergeWeights,
			maxCountByBaiDa,
			maxCountByDuobao,
			buyCountByDuoBao,
			duobaoIcon,
			baiDaIcon,
			iconIds,
		});
		const posResult: [number, number, number][] = [];
		prePosResult.forEach(({ fp, lp, icon }) => {
			if (isNumber(fp) && isNumber(lp)) {
				posResult.push([fp, lp, icon]);
			}
		});
		posResult.forEach((item) => {
			const [fp, lp, icon] = item;
			// 暂时只有银框和普通框的逻辑
			let bt: number;
			let ls: number;
			if (+icon === baiDaIcon || isEmpty(silverWeights)) {
				bt = 2;
				ls = 1;
			} else {
				const weights = silverWeights[icon];
				const isSilver = random.int(0, weights.length - 1) === 1;
				bt = isSilver ? 1 : 2;
				ls = isSilver ? 2 : 1;
			}
			info.push([fp, lp, bt, ls]);
		});
		const ebb = info
			.sort((a, b) => a[0] - b[0])
			.reduce((acc, crr, crrIdx) => {
				const [fp, lp, bt, ls] = crr;
				return {
					...acc,
					[crrIdx + 1]: {
						fp,
						lp,
						bt,
						ls,
					},
				};
			}, {} as Record<string, PGSlot.Ebb>);
		return [ebb, chunk(newRl, colLength)];
	}

	/**
	 * 获取 本局Ebb 的框信息
	 * @param {Object} options - 配置参数
	 * @param {number[]} options.rl - 随机数信息
	 * @param {number[][]} options.weights - 框合并的权重表
	 * @param {number} options.colLength - 列长度
	 * @param {number} options.rowLength - 行长度
	 * @param {number[]} options.iconIds - 排除百搭和夺宝图标 id的其他都有图标 id
	 * @param {number} options.maxCountByDuobao - 选填，夺宝最多占据几格，默认最多占据两格
	 * @param {number} options.buyCountByDuoBao - 选填，购买夺宝的个数，默认为4
	 * @param {number} options.duobaoIcon - 选填，夺宝图标 id，默认为 1
	 * @param {number} options.baiDaIcon - 选填，百搭图标 id，默认为 0
	 * @param {number} options.maxCountByBaiDa - 选填，百搭最多占据几格，默认最多占据两格
	 * @returns {Object} - 返回 Ebb 信息
	 */
	private getEbbPosition({
		rl,
		weights,
		maxCountByDuobao = 2,
		buyCountByDuoBao = 4,
		maxCountByBaiDa = 2,
		colLength,
		rowLength,
		duobaoIcon = 1,
		baiDaIcon = 0,
		iconIds,
	}: {
		rl: number[];
		weights: number[][];
		maxCountByDuobao?: number;
		buyCountByDuoBao?: number;
		colLength: number;
		rowLength: number;
		duobaoIcon?: number;
		baiDaIcon?: number;
		maxCountByBaiDa?: number;
		iconIds: number[];
	}): { fp: number; lp: number; icon: number }[] {
		let result: { fp: number; lp: number; icon: number }[] = [];
		let count: number = colLength;
		let duobaoPoss: { fp: number; lp: number; icon: number }[] = [];
		// 去掉头尾，只循环中间列信息
		const rowLen = rowLength - 2;
		for (let i = 1; i <= rowLen; i++) {
			let randomIndex = random.int(0, weights.length - 1);
			let randomSubArray = weights[randomIndex];
			randomSubArray.forEach((value) => {
				// 夺宝最多占据几格
				if (value <= maxCountByDuobao) {
					// 给购买夺宝用的数据
					duobaoPoss.push({
						fp: count,
						lp: count + value - 1,
						icon: rl[count],
					});
				}
				if (value > 1) {
					let newIcon = rl[count];
					if (value > maxCountByDuobao && rl[count] == duobaoIcon) {
						// 从 rl中找一个既不是夺宝也不是百搭
						for (let l = count; l <= count + value - 1; l++) {
							if (rl[count] !== duobaoIcon && rl[count] != baiDaIcon) {
								newIcon = rl[count];
								break;
							}
						}
						// 如果找不到，则从图标列表中随机一个非百搭和夺宝的图标
						if (newIcon == duobaoIcon || newIcon == baiDaIcon) {
							const randIcon: number[] = iconIds;
							let iconPos = random.int(0, randIcon.length - 1);
							newIcon = randIcon[iconPos];
						}
					}

					if (value > maxCountByBaiDa && rl[count] == baiDaIcon) {
						for (let l = count; l <= count + value - 1; l++) {
							// 从 rl中找一个既不是夺宝也不是百搭
							if (rl[count] != duobaoIcon && rl[count] != baiDaIcon) {
								newIcon = rl[count];
								break;
							}
						}
						// 如果找不到，则从图标列表中随机一个非百搭和夺宝的图标
						if (newIcon == baiDaIcon) {
							const randIcon: number[] = iconIds;
							let randomIconIndex = Math.floor(Math.random() * randIcon.length);
							newIcon = randIcon[randomIconIndex];
						}
					}

					result.push({ fp: count, lp: count + value - 1, icon: newIcon });
					for (let l = count; l <= count + value - 1; l++) {
						rl[l] = newIcon;
					}
				}
				count += value;
			});
		}
		// 如果是购买的夺宝
		if (this.isBuyDuoBao) {
			// 默认的夺宝数量
			let duobaoCount: number = 2;
			// 计算第一列的夺宝位置
			const firstColDuobaoPos = random.int(0, colLength - 1);
			rl[firstColDuobaoPos] = duobaoIcon;
			// 计算最后一列的夺宝位置
			const lastColDuobaoPos = random.int(
				(rowLength - 1) * colLength,
				rowLength * colLength - 1
			);
			rl[lastColDuobaoPos] = duobaoIcon;

			//在1-4随机两列放入两个夺宝
			duobaoPoss.forEach(({ fp, lp }) => {
				if (duobaoCount >= buyCountByDuoBao) {
					return;
				}
				for (let i = fp; i <= lp; i++) {
					rl[i] = duobaoIcon;
				}

				result.forEach((item) => {
					if (item.fp === fp && item.lp === lp) {
						item.icon = duobaoIcon;
					}
				});
				duobaoCount += 1;
			});
		}

		return result;
	}
}
