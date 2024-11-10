import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";
import { flatten, isEmpty, keys, toNumber, union } from "lodash";
import { TwCalculateType } from "utils/helper";
import Decimal from "decimal.js";

export default class ClassFeatSlot extends BaseSlot {
	constructor(options: BaseSlotOptions) {
		super(options);
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
		prevMf?: Record<string, number>;
	}): Record<string, number> {
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
	}) {
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
		return wp;
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
		wp?: Record<string, number[]>;
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
			[TwCalculateType.common]: (): number => {
				if (isEmpty(lw)) return 0;
				const ctw = BaseSlot._getCtw({ lw, gm });
				return new Decimal(gm).mul(ctw).toNumber();
			},
			[TwCalculateType.grandTotal]: (): number => {
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
}
