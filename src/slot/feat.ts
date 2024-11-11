import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";
import {
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
} from "lodash";
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

	/** 墨西哥：aw 计算 */
	public getAwBy1492288({ tw }: { tw: number }) {
		if (this.isDuoBaoPending) {
			const prevAw = this.prevSi?.aw || 0;
			return new Decimal(prevAw).add(tw);
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
}
