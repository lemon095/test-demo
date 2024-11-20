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
	isArray,
	isEmpty,
	isObject,
	keys,
	last,
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
	 * @returns number | void
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
	 * @returns { number[] } 图标对应的信息
	 */
	public static _findWinnerIconPosition({
		icons,
		targetIcon,
		colLength,
		colIndex,
		baiDaIcon = 0,
	}: {
		icons: number[];
		targetIcon: number;
		colLength: number;
		colIndex: number;
		baiDaIcon?: number;
	}) {
		const posInfo = [];
		for (let i = 0; i < icons.length; i++) {
			const icon = icons[i];
			// 当前图标是否为百搭
			const isCurrentBaiDa = icon === baiDaIcon;
			// 目标图标是否为百搭
			const isTargetBaiDa = targetIcon === baiDaIcon;
			if (icon === targetIcon || isCurrentBaiDa || isTargetBaiDa) {
				posInfo.push(i + colIndex * colLength);
			}
		}
		return posInfo;
	}
	/**
	 * 相邻路中奖信息计算
	 * @param { Object } options - 配置信息
	 * @param { number[][] } options.rl - 随机结果
	 * @param { number } options.duobaoIcon - 选填，夺宝图标的 id。默认为 1
	 * @param { number } options.baiDaIcon - 选填，百搭图标的 id。默认为 0
	 * @param { number } options.winCount - 选填，最低中奖路径数量。默认为 3
	 * @returns { Object | null } 返回中奖信息
	 */
	public getAdjoinWp({
		rl,
		duobaoIcon = 1,
		baiDaIcon = 0,
		winCount = 3,
	}: {
		rl: number[][];
		duobaoIcon?: number;
		baiDaIcon?: number;
		winCount?: number;
	}): Record<string, number[]> | null {
		const firstCol = rl[0];
		// 拿到列的长度
		const colLength = firstCol.length;
		// 拿到剩余列数据
		const cols = rl.slice(1);
		// 中奖信息
		const winnerPosition: Record<string, number[]> = {};
		for (let i = 0; i < firstCol.length; i++) {
			const icon = firstCol[i];
			// 夺宝不能连线
			if (icon === duobaoIcon) {
				continue;
			}
			const winnerPos = cols.map((col, index) =>
				ClassFeatSlot._findWinnerIconPosition({
					icons: col,
					targetIcon: icon,
					colLength,
					// 因为数据是从第二列开始截取的，所以要加 1
					colIndex: index + 1,
					baiDaIcon,
				})
			);
			const minWP = winnerPos.slice(0, winCount - 1);
			const notWinner = minWP.some((poss) => poss.length === 0);
			// 不满足最低中奖路径的条件，跳过当前循环
			if (notWinner) {
				continue;
			}
			// 已经出现最低中奖路径
			winnerPosition[icon] = [...(winnerPosition[icon] || []), i];
			minWP.forEach((poss) => {
				winnerPosition[icon].push(...poss);
			});
			// 拿到剩余的列中奖信息
			const afterWP = winnerPos.slice(winCount - 1);
			for (let j = 0; j < afterWP.length; j++) {
				const colWp = afterWP[j];
				// 未中奖则退出当前循环
				if (colWp.length === 0) break;
				// 添加中奖信息
				winnerPosition[icon].push(...colWp);
			}
		}
		if (isEmpty(winnerPosition)) return null;
		// 中奖路数据进行排序
		keys(winnerPosition).forEach((key) => {
			winnerPosition[key] = uniq(winnerPosition[key]).sort(function (a, b) {
				return a - b;
			});
		});
		return winnerPosition;
	}
}
