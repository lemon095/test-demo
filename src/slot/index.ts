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
import type { UserType } from "utils/helper";

export interface BaseSlotOptions {
	/** rl 权重表配置 */
	rlWeights: PGSlot.RandomWeights;
	/** trl 权重表配置 */
	trlWeights: PGSlot.RandomWeights;
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
}

export default class BaseSlot {
	/** rl的权重表 */
	private readonly rlWeightsMap: PGSlot.RandomWeights;
	/** trl的权重表 */
	private readonly trlWeightsMap: PGSlot.RandomWeights;
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
	 * @param count 当前次数
	 * @param total 总数，默认值为 15
	 */
	public isNotWinOver15(count: number, total = 15) {
		return count >= total;
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
		currentWp: Record<string, number[]>;
		crrFs: Record<string, any>;
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
	 * 计算本局中奖金额 - ctw
	 * @description 在某些场景下 tw = ctw，这时候 tw 通常会乘以本局的倍率信息
	 * @description 在某些场景下 tw = 0，则 ctw 通常是 lw 中中奖图标的基础价格总计。在整个中奖流程中，掉落的最后一次通常会计算累计中奖金额乘以累计倍率信息，ctw = tw，不过也有其他例外的情况。
	 * @description 那么在基础类目前只做最基本的逻辑运算，即 tw = lw price total * gm；如果 gm 没有则默认为 1
	 * @description 目前几个游戏 ctw 基本都为 lw 中奖金额的总计 * 倍数。极速和墨西哥除外。
	 * @param { Object } options - 配置信息
	 * @param { Record<string, number> |null } options.lw - 选填，中奖图标的基础价值
	 * @param { number } options.gm - 选填，图标的倍率信息，默认为 1
	 * @returns { number } 中奖金额
	 */
	public getCtw({
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
}
