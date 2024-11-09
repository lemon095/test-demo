import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";
import { keys, toNumber, union } from "lodash";

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
	getFixedPriceWp({
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
}
