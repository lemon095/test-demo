import { Decimal } from "@prisma/client/runtime/library";
import {
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
	isUndefined,
	keys,
	last,
	tail,
	union,
	uniq,
	uniqBy,
	values,
} from "lodash";
import random from "random";
import { PcwcCalculateType, TwCalculateType } from "utils/helper";
import RnsAdapter, { type RnsAdapterOptions } from "./RnsAdapter";

export interface BaseSlotOptions<T extends Record<string, any>> {
	/** rl 权重表配置 */
	rlWeights: PGSlot.RandomWeights;
	/** trl 权重表配置 */
	trlWeights?: PGSlot.RandomWeights;
	/** 用户类型 */
	userType: PGSlot.UserType;
	/** 上一局的信息 */
	prevSi?: T;
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
	/** 是否启用安全值，默认启用 */
	useSafeBet?: boolean;
}

export default class BaseSlot<T extends Record<string, any>> {
	/** rl的权重表 */
	private readonly rlWeightsMap: PGSlot.RandomWeights;
	/** trl的权重表 */
	private readonly trlWeightsMap?: PGSlot.RandomWeights;
	/** 是否启用安全值 */
	private readonly useSafeBet: boolean;
	/** 上一局的游戏信息 */
	private readonly prevSiData?: T;
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
	/** 总下注 - 安全值 */
	public readonly safeTotalBet: number;
	public readonly isFb?: boolean;
	/** 阈值：多少次不赢，默认为 15 */
	protected notWinnerTotal = 15;
	/** 累计多少次不赢，默认为 0 */
	protected notWinnerCount = 0;
	/** 本局预测的结果 */
	protected spinResult: T[] = [];
	/** 是否必中 */
	protected isRequiredWinner = false;
	/** 最大金额重摇次数 */
	protected maxPriceCount: number = 0;
	/** 最大si 重摇次数 */
	protected spinCount: number = 0;
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
		useSafeBet = true,
	}: BaseSlotOptions<T>) {
		this.rlWeightsMap = rlWeights;
		this.trlWeightsMap = trlWeights;
		this.useSafeBet = useSafeBet;
		this.userType = userType;
		this.prevSiData = prevSi;
		this.cs = cs;
		this.ml = ml;
		this.lineRate = lineRate;
		this.totalBet = new Decimal(cs).mul(ml).mul(lineRate).toNumber();
		this.safeTotalBet = new Decimal(cs).mul(ml).mul(lineRate).toNumber();
		if (isFb && gmFb) {
			this.totalBet = new Decimal(this.totalBet).mul(gmFb).toNumber();
			this.isFb = isFb;
		}
	}

	public get prevSi(): T | undefined {
		if (!isArray(this.spinResult) || isEmpty(this.spinResult)) {
			return this.prevSiData;
		}
		const prevSpin = this.spinResult[this.spinResult.length - 1];
		return prevSpin || this.prevSiData;
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
	public randomRl(weights: number[][], count: number, duobaoIcon: number = 1) {
		let result: number[][] = [];
		for (let i = 0; i < weights.length; i++) {
			const row: number[] = [];
			const colWeight = weights[i];
			let duobaoCount = 0;
			for (let j = 0; j < count; j++) {
				// 是否为起始位置
				const isStartPos = i === 0 && j === 0;
				// 第一列只能有一个夺宝图标
				const isFirstCol = i === 0 && duobaoCount > 0;
				if (isStartPos || isFirstCol) {
					const iconWeights = colWeight.filter((item) => item !== duobaoIcon);
					const idx = random.int(0, iconWeights.length - 1);
					row.push(iconWeights[idx]);
				} else {
					const idx = random.int(0, colWeight.length - 1);
					const icon = colWeight[idx];
					if (icon === duobaoIcon) {
						duobaoCount++;
					}
					row.push(colWeight[idx]);
				}
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
		// 先判断是否存在预测行为
		if (isArray(this.spinResult) && !isEmpty(this.spinResult)) {
			const prevSpin = this.spinResult[this.spinResult.length - 1];
			return !isEmpty(prevSpin?.wp);
		}
		// 在判断上一次是否中奖
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
		const { fs } = this.prevSi || ({} as any);
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
	 * @param {Object} options.rwsp 选填，中奖线图标倍率
	 * @returns {Record<string, number>|null} 中奖的基础金额信息
	 * @description 如果是存在中奖线路数的游戏，snww 必传。
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
		const totalBet = this.useSafeBet ? this.safeTotalBet : this.totalBet;
		return keys(rwsp).reduce((acc, winId) => {
			const winCount = isEmpty(snww) ? 1 : snww[winId];
			return {
				...acc,
				[winId]: new Decimal(totalBet)
					.div(this.lineRate)
					.mul(rwsp[winId])
					.mul(winCount)
					.toNumber(),
			};
		}, lw);
	}

	/**
	 * 静态方法 计算本局中奖金额 - ctw
	 * @returns { number } 中奖金额
	 * @description 使用静态方法是不想外部子类 改最基本的 ctw 的逻辑，因为其他方法也会调用这段逻辑
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
	 * @param { Object } options - 配置信息
	 * @param { Record<string, number> |null } options.lw - 选填，中奖图标的基础价值
	 * @param { number } options.gm - 选填，图标的倍率信息，默认为 1
	 * @returns { number } 中奖金额
	 * @description 在某些场景下 tw = ctw，这时候 tw 通常会乘以本局的倍率信息
	 * @description 在某些场景下 tw = 0，则 ctw 通常是 lw 中中奖图标的基础价格总计。在整个中奖流程中，掉落的最后一次通常会计算累计中奖金额乘以累计倍率信息，ctw = tw，不过也有其他例外的情况。
	 * @description 目前几个游戏 ctw 基本都为 lw 中奖金额的总计 * 倍数。极速和墨西哥除外。
	 * @description 那么在基础类目前只做最基本的逻辑运算，即静态方法 _getCtw 内实现的逻辑；如果 gm 没有则默认为 1
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
	 * @param {Object} options.cgsp - 金框位置的掉落信息
	 * @param {Record<string, any>[]} options.gmTables - 金框的倍率权重表
	 * @returns {Object} - 金框倍率信息
	 */
	public getMf({
		gsp,
		prevMf,
		gmTables,
		cgsp,
		iconIds,
		maxGMByIconIds = 5,
	}: {
		gmTables: { icon: number; weight: number }[];
		iconIds: number[];
		maxGMByIconIds?: number;
		gsp?: number[];
		cgsp?: number[][] | null;
		prevMf?: Record<string, number>;
	}): Record<string, number> {
		const innerCgsp = isArray(cgsp) ? cgsp : [];
		const currentMfKeys: number[] = [];
		// 获取下落的 mf
		const fallMf = innerCgsp.reduce((acc, item) => {
			const isErr = item.some((item) => !isNumber(+item) || isNaN(+item));
			if (isErr) return acc;
			const [prev_mf_key, current_mf_key] = item;
			const prevGm = prevMf?.[prev_mf_key] || 0;
			currentMfKeys.push(current_mf_key);
			return {
				...acc,
				[current_mf_key]: prevGm,
			};
		}, {} as Record<string, number>);
		// 剔除掉已经下落的图标
		const newGsp = difference(gsp || [], currentMfKeys);
		let gms: number[] = [];
		if (newGsp.length) {
			gms = this.convertWeights(gmTables);
		}
		const currentMf = newGsp.reduce((acc, key) => {
			if (iconIds.includes(+key)) {
				gms = gms.filter((gm) => gm <= maxGMByIconIds);
			}
			const gmPos = random.int(0, gms.length - 1);
			const gm = prevMf?.[key] ?? gms[gmPos];
			return {
				...acc,
				[key]: gm,
			};
		}, {} as Record<string, number>);
		return {
			...fallMf,
			...currentMf,
		};
	}

	/**
	 * 固定中奖路线的wp计算 - (不包含列合并情况的计算，如遇到类似的游戏需要重写)
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
	}): {
		wp: Record<string, number[]> | null;
		winnerLineCount: Record<string, number> | null;
	} {
		// 需要考虑的条件：1. 夺宝不能中奖 2. 百搭可以搭配任意字符
		const wp: Record<string, number[]> | null = {};
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
		if (isEmpty(wp)) {
			return {
				wp: null,
				winnerLineCount: null,
			};
		}
		const winnerLineCount = keys(wp).reduce((acc, winId) => {
			return {
				...acc,
				[winId]: wp[winId].length,
			};
		}, {} as Record<string, number>);
		return {
			wp,
			winnerLineCount,
		};
	}

	/**
	 * 获取中奖路图标对应的倍率
	 * @param {Object} options - 参数对象
	 * @param {Record<string, number[]>} options.wp - 图标的中奖信息
	 * @param {Record<string, Record<number, number>>} options.iconMul - 图标对应的倍率信息
	 * @param {number[][]} options.rl - 本次中奖的图标数组
	 * @param {number} options.winnerLineCount - 中奖奖信息，如果 3 列中奖则 是 3 连线
	 * @returns {Record<string, number>} 中奖图标对应的倍数
	 * @description 目前的游戏第一列不会出现百搭符号，如果有存在第一列有百搭符号的。那么 wp 和 rwsp 的计算都不适用
	 */
	public getRwsp({
		wp,
		rl,
		winnerLineCount,
		iconMul,
	}: {
		wp?: Record<string, number[]> | null;
		rl: number[][];
		winnerLineCount?: Record<string, number> | null;
		iconMul: Record<string, Record<number, number>>;
	}) {
		if (isEmpty(wp)) return null;
		if (isEmpty(winnerLineCount)) {
			throw new Error("winnerLineCount is required");
		}
		const orl = flatten(rl);
		return keys(wp).reduce((acc, winId) => {
			// 固定中奖线的游戏，winId 不是游戏图标 id，而是中奖线 id。
			const posArr = wp[winId];
			const pos = posArr[0];
			// 兼容固定中奖线的情况，所以从 rl 中重新获取下中奖图标的信息
			const icon = orl[pos];
			const lineCount = winnerLineCount[winId];
			return {
				...acc,
				[winId]: iconMul[icon][lineCount],
			};
		}, {} as Record<string, number>);
	}

	/**
	 * 通用 tw 计算
	 * @param {Object} options - 参数对象
	 * @param {Object} options.lw - 本局中奖图标的基础金额
	 * @param {Number} options.gm - 选填，本局倍率或者累计倍率，默认为 1
	 * @param {Number} options.totalPrice - 选填，累计的总金额，只会在累计倍率的模式下使用，默认为 0
	 * @param {Boolean} options.isCurrentWinner - 选填，当前是否中奖
	 * @param {TwCalculateType} options.mode - tw 计算方式
	 * @returns {Number} tw 金额
	 * @description 目前接触到几个游戏中，tw 有两种计算方式，如果有累计倍数的逻辑则走 累计模式，否则走通用模式
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
				return BaseSlot._getCtw({ lw, gm });
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
		const prevSsaw = this.isPreWin ? this.prevSi?.ssaw || 0 : 0;
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
	 * @param {Object} options - 参数对象
	 * @param {number[][]} options.rl - 下方图信息
	 * @param {number[]} options.trl - 选填，上方图信息。如果不填则是空数组
	 * @param {Record<string, number[]>} options.esb - 选填，如果存在图标合并成框的信息，那么需要用到这个参数
	 * @param {number} options.duobaoIcon - 选填，夺宝图标的id，默认为 1
	 * @param {number} options.skipRow - 选填，需要跳过的行数 (从 1 开始数)
	 * @returns {number} 夺宝图标的数量
	 * @description 有些游戏的每一列图标是会合并的。所以需要用到合并框的信息（ebb）
	 * @description 有些游戏会跳过某一行的信息，比如墨西哥。那么需要传入跳过行的信息
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
	 * @param {Object} options.scRadix - 需要进入夺宝模式下的夺宝基数
	 * @param {Object} options.currentWp - 当前中奖图标信息
	 * @returns {number} 当前游戏状态 1|4|21|22
	 */
	public getNst({
		sc = 0,
		fs,
		currentWp,
		scRadix,
	}: {
		currentWp?: Record<string, any> | null;
		sc?: number;
		fs?: Record<string, any> | null;
		scRadix: number;
	}): number {
		if (this.isDuoBaoPending) {
			// 当前为夺宝的最后一次
			if (this.isLastDuoBao({ crrFs: fs, currentWp })) return 1;
			// 当前未中奖
			if (isEmpty(currentWp)) return 21;
			// 当前中奖
			return 22;
		}
		if (sc >= scRadix && isEmpty(currentWp)) return 21;
		if (isEmpty(currentWp)) return 1;
		return 4;
	}
	/**
	 * 获取当前局游戏状态
	 * @returns {number} 当前游戏状态 1|4|21|22
	 */
	public getSt(prevNst?: number) {
		return prevNst ?? 1;
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
	public getCwc({
		wp,
		prevCwc,
	}: {
		wp?: Record<string, any> | null;
		prevCwc?: number;
	}) {
		let cwc = 0;
		const isWin = !isEmpty(wp);
		if (isWin) {
			cwc = 1;
			if (this.isPreWin) {
				cwc += prevCwc || 0;
			}
		}
		return cwc;
	}

	/**
	 * 获取 gwt
	 * @param {number} aw - aw
	 * @description 位置含义的参数，所以计算逻辑只是按照当初的理解来写的
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
	 * @param {number} options.baiDaIcon - 百搭图标 id,默认 0
	 * @return {number[]|null} 非金框下的数值
	 */
	public getPtrBy1492288({
		wp,
		gsp,
		rl,
		baiDaIcon = 0,
	}: {
		gsp: number[];
		wp?: Record<string, any> | null;
		rl: number[][];
		baiDaIcon?: number;
	}): number[] | null {
		if (isEmpty(wp)) return null;
		const rlList = flattenDeep(rl);
		const realGsp = gsp.filter((pos) => rlList[pos] !== baiDaIcon);
		const innerWp = cloneDeep(wp);
		const wpValues = flattenDeep(values(innerWp));
		return union(wpValues.filter((v) => !realGsp.includes(v))).sort(
			(a, b) => a - b
		);
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
		rl,
	}: {
		gsp: number[];
		wp?: Record<string, number[]> | null;
		rl: number[][];
	}): number[] | null {
		if (isEmpty(wp)) return null;
		const rlList = flattenDeep(rl);
		const realGsp = gsp.filter((pos) => rlList[pos] !== 0);
		const innerWp = cloneDeep(wp);
		const wpValues = flattenDeep(values(innerWp));
		return union(wpValues.filter((v) => realGsp.includes(v))).sort(
			(a, b) => a - b
		);
	}

	/**
	 * 墨西哥：ge 计算
	 * @param {Object} options - 配置项
	 * @param {Object|null} options.wp - 中奖图标信息
	 * @param {Object|null} options.wsp - 中奖图标的金框位置
	 * @param {Object|null} options.mf - 金框对应的倍率信息
	 * @param {number} options.nst - 下一次游戏的模式信息
	 * @param {number} options.mode - 非夺宝模式下中奖模式的 st 信息，默认值为 4
	 * @return {number[]} 游戏模式信息
	 * @description 不是通用的计算方式
	 */
	public getGeBy1492288({
		wsp,
		mf,
		nst,
		wp,
		mode = 4,
	}: {
		nst: number;
		wp?: Record<string, number[]> | null;
		wsp?: number[] | null;
		mf?: Record<string, number> | null;
		mode?: number;
	}): number[] {
		const ge = [11];
		// 是否存在消除的金框倍率信息
		const isGlod = wsp?.some((pos) => (mf?.[pos] ?? 0) > 0);
		const isCurrentWinner = !isEmpty(wp);
		const prevGlod: boolean = this.prevSi?.ge?.some(
			(item: number) => item === 3
		);
		// 夺宝模式
		if (nst > mode) {
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
	 * @param {Object} options - 参数对象
	 * @param {number} options.nst 下一次游戏的模式信息
	 * @param {number} options.mode 非夺宝模式下中奖模式的 st 信息，默认值为 4
	 * @returns {number[]} 当前游戏的模式信息
	 */
	public getGe({ nst, mode = 4 }: { nst: number; mode?: number }): number[] {
		if (nst > mode) {
			return [2, 11];
		}
		return [1, 11];
	}

	/**
	 * 通用：fstc 游戏模式的累计中奖信息
	 * @returns {Object|null}
	 */
	public getFstc(
		prevFstc: Record<string, number> | null
	): Record<string, number> | null {
		prevFstc = prevFstc || {};
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
			let prevGm = 0;
			// s === ts 表示触发夺宝
			if (
				!isEmpty(this.prevSi?.fs) &&
				this.prevSi?.fs.s !== this.prevSi?.fs.ts
			) {
				prevGm = this.prevSi?.gm || 1;
			}
			// 如果为 1，则返回 cgm
			if (prevGm === 1) {
				return cgm || 1;
			}
			return cgm + prevGm || 1;
		}
		const prevGm: number = this.isPreWin ? this.prevSi?.gm || 1 : 1;
		// 如果为 1，则返回 cgm
		if (prevGm === 1) {
			return cgm || 1;
		}
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
		prevFs,
	}: {
		sc: number;
		scRadix: number;
		tw: number;
		scGm?: number;
		playCount?: number;
		prevFs?: Record<string, any> | null;
	}): ({ s: number; ts: number; aw: number } & Record<string, any>) | null {
		// 触发夺宝
		if (sc >= scRadix) {
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
			const prev_fs = prevFs as { s: number; ts: number; aw: number };
			const aw = new Decimal(tw).add(prev_fs.aw).toNumber();
			if (this.isPreWin) {
				return {
					...prev_fs!,
					// 只统计夺宝流程下的中奖金额，免费掉落的夺宝也是一样的
					aw,
				};
			}
			return {
				...prev_fs!,
				s: prev_fs!.s - 1,
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
	 * @param {Array} options.rl - 随机数列表
	 * @param {Array} options.preRl - 上一次的随机数列表
	 * @param {number} options.baiDaIcon - 百搭图标的 id,默认为 0
	 * @returns { number }
	 */
	public getGsp({
		rl,
		cgsp,
		ngsp,
		preGsp,
		rate,
		preRl,
		baiDaIcon = 0,
	}: {
		rl: number[][];
		cgsp: number[][] | null;
		ngsp: number[] | null;
		preGsp: number[];
		rate: number[];
		preRl?: number[];
		baiDaIcon?: number;
	}): number[] {
		if (!this.isPreWin) {
			const gspResult: number[] = [];
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
		const _ngsp = isArray(ngsp) ? ngsp : [];
		const _cgsp = isArray(cgsp) ? cgsp : [];
		// 需要删除的 gsp 集合
		const diff_gsp: number[] = [];
		// 需要更新位置的 gsp 集合
		const move_gsp: number[] = [];
		// 收集百搭图标的 gsp 信息
		const gsp_baida = preGsp.filter((gsp) => preRl?.[gsp] === baiDaIcon);
		// 删除百搭图标的 gsp
		const _prev_gsp: number[] = preGsp.filter((gsp) => {
			return preRl?.[gsp] !== baiDaIcon;
		});

		for (let i = 0; i < _cgsp.length; i++) {
			const [preGsp, curGsp] = _cgsp[i];
			if (gsp_baida.includes(preGsp)) {
				continue;
			}
			if (isNumber(+preGsp)) {
				diff_gsp.push(preGsp);
			}
			if (isNumber(+curGsp)) {
				move_gsp.push(curGsp);
			}
		}
		const gsp: number[] = difference(
			[..._ngsp, ...move_gsp, ..._prev_gsp],
			diff_gsp
		);
		return gsp;
	}

	/**
	 * cgsp 金框元素下落信息
	 * @param {Object} options - 配置信息
	 * @param {Array} options.preGsp - 上一次金框的位置信息
	 * @param {Array} options.prePtr - 上一次普通框消失的位置信息
	 * @param {Number} options.colLength- 列的长度
	 * @param {Array} options.preOrl - 上一次的随机数信息
	 * @param {number} options.baiDaIcon - 百搭图标的 id,默认为 0
	 * @returns {number[][] | null}
	 */
	public getCgsp({
		preOrl,
		preGsp,
		prePtr,
		colLength,
		baiDaIcon = 0,
	}: {
		preOrl: number[];
		preGsp: number[];
		prePtr: number[];
		colLength: number;
		baiDaIcon?: number;
	}): number[][] | null {
		if (!this.isPreWin || preGsp.length === 0) {
			return null;
		}
		const newpreOrl = chunk(preOrl, colLength);
		let cgsp: number[][] = [];
		newpreOrl.forEach((item, index) => {
			preGsp.forEach((value) => {
				const posStart = item.length * index;
				const posEnd = posStart + item.length - 1;
				if (
					posStart <= value &&
					posEnd >= value &&
					preOrl[value] !== baiDaIcon
				) {
					let posi = 0;
					prePtr.forEach((prePos) => {
						if (prePos > value && prePos <= posEnd) {
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
	 * @param {Array} options.rns 掉落下的图标信息
	 * @param {Array} options.rate 每一列的金框概率
	 * @param {Number} options.colLength 列的长度
	 * @param {number} options.baiDaIcon 百搭图标的 id
	 * @param {number} options.duobaoIcon 夺宝图标的 id
	 * @returns {number[]|null} 掉落图标的金框概率
	 */
	public getNgsp({
		rns,
		rate,
		colLength,
		baiDaIcon = 0,
		duobaoIcon = 1,
	}: {
		rns?: number[][] | null;
		rate: number[];
		colLength: number;
		baiDaIcon?: number;
		duobaoIcon?: number;
	}): number[] | null {
		if (!this.isPreWin || !isArray(rns)) {
			return null;
		}
		let gspResult: number[] = [];

		rns.forEach((item, index) => {
			item.forEach((i, iIndex) => {
				const pos = colLength * index + iIndex;
				const randomNumber = Math.random() * 100;
				if (randomNumber < rate[index] && i != baiDaIcon && i != duobaoIcon) {
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
		winnerLineCount: Record<string, number> | null;
	} {
		const firstCol = rl[0];
		// 拿到列的长度
		const colLength = firstCol.length;
		// 拿到剩余列数据
		const cols = rl.slice(1);
		// 中奖信息
		const winnerPosition: Record<string, number[]> = {};
		const topWinnerPosition: Record<string, number[]> = {};

		// 连线信息，3 列相邻中奖就是 3 连。
		// let lineCount = 0;
		// trl 是否成立
		const isHaveTrl = isArray(trl) && trl.length > 0;
		for (let i = 0; i < firstCol.length; i++) {
			const icon = firstCol[i];
			// 夺宝不能连线
			if (icon === duobaoIcon) {
				continue;
			}
			const trlWinnerPos = BaseSlot._findWinnerIconPosition<true>({
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
				BaseSlot._findWinnerIconPosition({
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
		if (isEmpty(winnerPosition)) {
			return { wp: null, twp: null, winnerLineCount: null };
		}
		// 中奖路数据进行排序
		keys(winnerPosition).forEach((key) => {
			winnerPosition[key] = uniq(winnerPosition[key]).sort(function (a, b) {
				return a - b;
			});
		});
		const twp = keys(topWinnerPosition).reduce((acc, key) => {
			if (isEmpty(topWinnerPosition[key])) return acc;
			return {
				...acc,
				[key]: uniq(topWinnerPosition[key]),
			};
		}, {} as Record<string, number[]>);
		const winnerLineCount = Object.keys(winnerPosition).reduce(
			(acc, iconId) => {
				const maxWp = Math.max(...winnerPosition[iconId]);
				let lineCount = Math.floor(maxWp / colLength) + 1;
				const twpLineCount = twp[iconId]?.map((item) => item + 2) || [];
				lineCount = Math.max(lineCount, ...twpLineCount);
				return {
					...acc,
					[iconId]: lineCount,
				};
			},
			{} as Record<string, number>
		);
		return {
			wp: winnerPosition,
			twp: isEmpty(twp) ? null : twp,
			winnerLineCount,
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
				if (posIndex.length < mergeCount) {
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
	 * @param {Object} options - 配置参数
	 * @param {Object} options.esb - 单元格合并的信息
	 * @param {number[][]} options.rl - 随机数信息
	 * @param {number} options.trlCellCount - 选填，trl 默认的单元格数量，默认为1，没有传入 0
	 * @returns {number[]} nowpr - 每一列的单元格数量
	 * @description 鉴于目前一些游戏的 trl 都一样，所以 trl中的数据会默认当做 1 个单元格来计算，没有 trl信息，传入 0 即可
	 * @description 方法内部已根据 rl 数据自动获取到了 行长度和列长度信息。
	 * @description rl 收尾两列的图标默认不参与合并逻辑，所以每一个图标都算是一个单独的单元格
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
			} else {
				result[rowIndex] = trlCellCount;
			}
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
	 * @param {Object} record - 框合并的信息
	 * @returns {Object} 合并框中的每一个图标位置信息
	 * @description 这两个字段的输入和输出一致
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
		wp?: Record<string, number[]> | null;
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
		prevEb,
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
		prevEb?: Record<string, PGSlot.Ebb> | null;
	}): [Record<string, PGSlot.Ebb>, number[][]] {
		if (this.isPreWin) {
			if (isEmpty(rs)) {
				throw new Error("rs is null in prewin");
			}
			// if (isEmpty(prevEb)) {
			// 	throw new Error("eb is null in prewin");
			// }
			const ebb = cloneDeep(prevEb || {});
			// 如果 esst 没有信息，则不会进行框的颜色变更操作. 比如极速游戏
			keys(rs.esst || {}).forEach((keyIdx) => {
				const isBaiDa = rs.esst[keyIdx].ns === baiDaIcon;
				const bt = isBaiDa ? 2 : 1;
				const ls = isBaiDa ? 1 : 1;
				if (isEmpty(ebb[keyIdx])) {
					return;
				}
				ebb[keyIdx] = {
					...ebb[keyIdx],
					bt,
					ls,
				};
			});
			keys(rs.espt).forEach((keyIdx) => {
				if (isEmpty(ebb[keyIdx])) {
					return;
				}
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
				const isSilver = weights[random.int(0, weights.length - 1)] === 1;
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
							let iconPos = random.int(0, randIcon.length - 1);
							newIcon = randIcon[iconPos];
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

	/**
	 * 处理 bwp 信息
	 * @param {Object} options - 配置参数
	 * @param {Object} options.wp - 中奖信息
	 * @param {Object} options.esb - 框合并信息
	 * @returns {Object} - bwp 中奖信息
	 */
	public getBwp({
		wp,
		esb,
	}: {
		wp?: Record<string, number[]> | null;
		esb: Record<string, number[]>;
	}): Record<string, number[][]> | null {
		if (isEmpty(wp)) return null;
		return keys(wp).reduce((bwp, crrKey) => {
			const bwpValue: number[][] = [];
			const wpValue = wp[crrKey];
			const posArrSet = values(esb);
			wpValue.forEach((item) => {
				const posArr = posArrSet.find((posArr) => posArr.includes(item));
				if (posArr) {
					bwpValue.push(posArr);
				} else {
					bwpValue.push([item]);
				}
			});
			return {
				...bwp,
				[crrKey]: uniq(bwpValue),
			};
		}, {} as Record<string, number[][]>);
	}

	/**
	 * 掉落下非普通框的图标变换
	 * @param {Object} options - 配置参数
	 * @param {Object} options.prevBwp - 上一次的 bwp 信息
	 * @param {Object} options.prevEbb - 上一次的 ebb 信息
	 * @param {PGSlot.WeightCfg[]} options.goldWeights - 金框图标的权重表
	 * @param {number} options.baiDaIcon - 百搭图标 id，默认为 0
	 * @returns {Object} 金框权重
	 */
	public getRsEsst({
		prevBwp,
		prevEbb,
		goldWeights,
		baiDaIcon = 0,
	}: {
		prevBwp?: Record<string, number[][]> | null;
		prevEbb: Record<string, PGSlot.Ebb> | null;
		goldWeights: PGSlot.WeightCfg[];
		baiDaIcon?: number;
	}): {
		esst: Record<
			string,
			{
				os: number;
				ns: number;
			}
		>;
		bewb: Record<string, PGSlot.Ebb>;
	} {
		if (isEmpty(prevBwp)) {
			return { esst: {}, bewb: {} };
		}
		const esst: Record<
			string,
			{
				os: number;
				ns: number;
			}
		> = {};
		const bewb: Record<string, PGSlot.Ebb> = {};
		const weights = this.convertWeights(goldWeights);
		keys(prevBwp).forEach((icon) => {
			prevBwp[icon].forEach((pos) => {
				if (pos.length < 2) {
					return;
				}
				// 寻找合并的图案
				const fp = pos[0];
				const lp = pos[pos.length - 1];
				keys(prevEbb).forEach((index) => {
					if (isEmpty(prevEbb)) return;
					if (prevEbb[index].fp === fp && prevEbb[index].lp === lp) {
						// 银变金
						if (this.getEbbBorderColor(prevEbb[index], "银")) {
							// if (oldEbb[index].bt === 1 && oldEbb[index].ls === 2) {
							const idx = random.int(0, weights.length - 1);
							esst[index] = { os: +icon, ns: weights[idx] };
						}
						// 金变百搭
						if (this.getEbbBorderColor(prevEbb[index], "金")) {
							// if (oldEbb[index].bt === 1 && oldEbb[index].ls === 1) {
							esst[index] = { os: +icon, ns: baiDaIcon };
							bewb[index] = { fp: fp, lp: lp, ls: 0, bt: 1 };
						}
					}
				});
			});
		});

		return { esst, bewb };
	}

	/**
	 * 掉落情况下的 espt 逻辑处理
	 * @param {Object} options - 配置参数
	 * @param {Object} options.preBwp - 上一次的 bwp
	 * @param {Object} options.preEbb - 上一次的 ebb
	 * @param {[number, number][]} options.col2to5 - 列的信息
	 * @param {number} options.baiDaIcon - 百搭图标 id，默认为 0
	 * @returns {Object} espt 的信息
	 */
	public getRsEspt({
		preBwp,
		preEbb,
		baiDaIcon = 0,
		col2to5,
	}: {
		preBwp: Record<string, number[][]> | null;
		preEbb: Record<string, PGSlot.Ebb> | null;
		baiDaIcon?: number;
		col2to5: [number, number][];
	}): Record<
		string,
		{
			op: number[];
			np: number[];
		}
	> {
		if (isEmpty(preBwp)) return {};
		// const col2to5 = [
		// 	[5, 9],
		// 	[10, 14],
		// 	[15, 19],
		// 	[20, 24],
		// ];
		const preEbbKeys = keys(preEbb);
		// 删除的框的信息集合，单图标消失也算框
		const removeBordereds: { fp: number; lp: number }[] = [];
		// 不删的框的信息集合
		const remainBordereds: {
			fp: number;
			lp: number;
			key: string;
			bt: number;
			ls: number;
		}[] = [];
		// 获取 bwp 中 长度大于等于 2 的框
		const winPosBordered: { pos: number[]; icon: string | number }[] = [];
		keys(preBwp).forEach((icon) => {
			const winPos = preBwp[icon];
			// 如果是百搭
			for (let i = 0; i < winPos.length; i++) {
				if (winPos[i].length < 2) {
					removeBordereds.push({ fp: winPos[i][0], lp: winPos[i][0] });
					continue;
				}
				winPosBordered.push({ pos: winPos[i], icon: icon });
			}
		});
		preEbbKeys.forEach((ebbKey) => {
			const ebb = preEbb?.[ebbKey] || ({} as any);
			const haveWin = winPosBordered.find(
				(pos) => ebb.fp === pos.pos[0] && ebb.lp == pos.pos[pos.pos.length - 1]
			);
			if (haveWin) {
				// 如果是普通框
				const isBaiDa = +haveWin.icon === baiDaIcon;
				// const isNormalBordered = ebb.bt === 2 && ebb.ls === 1;
				const isNormalBordered = this.getEbbBorderColor(ebb, "普通");
				if (isNormalBordered || isBaiDa) {
					// 消框
					removeBordereds.push({ fp: ebb.fp, lp: ebb.lp });
				} else {
					// 保留框
					remainBordereds.push({
						fp: ebb.fp,
						lp: ebb.lp,
						key: ebbKey,
						bt: ebb.bt,
						ls: ebb.ls,
					});
				}
			} else {
				// 保留框
				remainBordereds.push({
					fp: ebb.fp,
					lp: ebb.lp,
					key: ebbKey,
					bt: ebb.bt,
					ls: ebb.ls,
				});
			}
		});
		const espt = remainBordereds.reduce(
			(espt, bordered) => {
				col2to5.forEach((item) => {
					esptHandle({ col: item, espt, bordered });
				});
				return espt;
			},
			{} as Record<
				string,
				{
					op: number[];
					np: number[];
				}
			>
		);

		function esptHandle({
			col: [start, end],
			bordered,
			espt,
		}: {
			col: number[];
			bordered: { fp: number; lp: number; key: string; bt: number; ls: number };
			espt: Record<
				string,
				{
					op: number[];
					np: number[];
				}
			>;
		}) {
			if (bordered.fp >= start && bordered.lp <= end) {
				// 获取每列被删除的信息
				const removeColInfo = uniqBy(removeBordereds, "fp").filter(
					(remove) => remove.fp >= start && remove.lp <= end
				);
				removeColInfo.forEach((colBordered) => {
					if (colBordered.lp > bordered.lp) {
						// 删除框的长度
						const removeLen = colBordered.lp - colBordered.fp + 1;
						const preFp = espt[bordered.key]?.np?.[0] || bordered.fp;
						const preLp = espt[bordered.key]?.np?.[1] || bordered.lp;
						espt[bordered.key] = {
							op: [bordered.fp, bordered.lp],
							np: [preFp + removeLen, preLp + removeLen],
						};
					}
				});
			}
		}
		return espt;
	}

	/**
	 * 获取掉落下的 trns
	 * @param {Object} options - 配置参数
	 * @param {number[]} options.trl - trl 随机数列表
	 * @param {'noPrize' | undefined} options.mode - 模式，noPrize 表示没有中奖
	 * @param {number[]} options.icons - 图标列表
	 * @param {number[]} options.prevTptbr - 上一次的 tptbr
	 * @param {number} options.trlLength - trl 长度，默认为 4
	 * @returns {number[]} trl 的掉落图标列表
	 */
	public getRsTrns({
		trl,
		prevTptbr,
		mode,
		icons,
		trlLength = 4,
	}: {
		trl: number[];
		trlLength?: number;
		prevTptbr: number[];
		mode?: "noPrize";
		icons: number[];
	}): number[] {
		let newTrl: number[] = [];
		if (mode === "noPrize") {
			for (let i = 0; i < trlLength; i++) {
				const idx = random.int(0, icons.length - 1);
				newTrl.push(icons[idx]);
			}
		} else {
			newTrl = trl;
		}
		return prevTptbr.map((index) => {
			return newTrl[index];
		});
	}

	/**
	 * 获取掉落流程下的 trl 信息
	 * @param {Object} options - 配置参数
	 * @param {number[]} options.prevTrl - 上一次的trl 随机数列表
	 * @param {number[]} options.prevTptbr - 上一次 trl 中的中奖信息
	 * @param {number[]} options.trns - 本局会掉落的 trl 图标
	 * @returns {number[]} trl 的信息
	 */
	public getRsTrl({
		prevTptbr,
		prevTrl,
		trns,
	}: {
		prevTrl?: number[] | null;
		prevTptbr?: number[] | null;
		trns: number[];
	}): number[] {
		if (isEmpty(prevTrl) || isEmpty(prevTptbr)) {
			return prevTrl || [];
		}
		let filtertRl: number[] = [];
		// 去除上一轮中奖的图标
		prevTrl!.forEach((element, index) => {
			if (!prevTptbr?.includes(index)) {
				filtertRl.push(element);
			}
		});

		return [...filtertRl, ...trns];
	}

	/**
	 * 掉落流程下的 rl 数据
	 * @param {Object} options - 配置参数
	 * @param {number[]} options.prevRl - 上一次的 rl 随机数列表
	 * @param {Object} options.prevBwp - 上一次的中奖信息
	 * @param {Object} options.prevEbb - 上一次的框合并信息
	 * @param {number[][]} options.rns - 本局掉落的 rl 图标列表
	 * @param {Object} options.esst - 本局掉落下需要变化图标的信息
	 * @param {number} options.colLength - 列长度
	 */
	public getRsRl({
		prevRl,
		prevBwp,
		prevEbb,
		rns,
		esst,
		colLength,
	}: {
		prevRl: number[];
		prevBwp: Record<string, number[][]> | null;
		prevEbb: Record<string, PGSlot.Ebb> | null;
		rns: number[][];
		esst: Record<
			string,
			{
				os: number;
				ns: number;
			}
		>;
		colLength: number;
	}): number[][] {
		const prevRlArr = chunk(prevRl, colLength);
		const rowLength = prevRlArr.length;
		const replaceIndex: number[][] = Array.from(
			{ length: rowLength },
			() => []
		);

		keys(prevBwp).forEach((icon) => {
			const oldWinPos = prevBwp![icon];
			oldWinPos.forEach((posIdxs) => {
				const first = posIdxs[0];
				const last = posIdxs[posIdxs.length - 1];
				for (let rowIndex = 0; rowIndex < rowLength; rowIndex++) {
					// 计算每一列的起始索引
					const start = rowIndex * colLength;
					// 计算每一列的结束索引
					const end = start + colLength - 1;
					if (first >= start && last <= end) {
						posIdxs.forEach((idx) => {
							replaceIndex[rowIndex].push(idx - rowIndex * colLength);
						});
						break;
					}
				}
			});
		});
		// 获取替换的 icon和替换的位置
		const esstPos: {
			start: number;
			end: number;
			icon: number;
			col: number;
		}[][] = Array.from({ length: rowLength }, () => []);
		keys(esst).forEach((keyIdx) => {
			if (isEmpty(prevEbb)) {
				return;
			}
			const oldEbbVal = prevEbb[keyIdx];
			const [start, end] = [oldEbbVal.fp, oldEbbVal.lp];
			let col = Math.floor(end / colLength);
			esstPos[col].push({ start, end, icon: esst[keyIdx].ns, col });
		});
		// 先替换 icon 和删除 需要消失的 icon
		const newRl = prevRlArr.map((icons, col) => {
			const removeIdxs = replaceIndex[col];
			const replaceIcon = esstPos[col];
			return icons
				.map((icon, iconIdx) => {
					const isReplace = replaceIcon.find((pos) => {
						const rlIconIdx = iconIdx + col * colLength;
						return rlIconIdx >= pos.start && rlIconIdx <= pos.end;
					});
					// 是否需要替换的图标
					if (isReplace) {
						return isReplace.icon;
					} else if (removeIdxs.includes(iconIdx)) {
						// 删除
						return null;
					} else {
						// 既不删除也不替换
						return icon;
					}
				})
				.filter((icon) => isNumber(icon)) as number[];
		});

		return newRl.map((icons, col) => {
			const newIcons = rns[col];
			// 掉落新的 icon
			return [...newIcons, ...icons];
		});
	}

	/**
	 * 获取最大可中奖金额
	 * @param {number} maxAmount - 最大金额，默认值为 20000
	 * @returns {number} 最大可中奖金额
	 */
	public getMaxPrice(maxAmount = 20000) {
		const maxPrice = Math.min(
			this.safeTotalBet * 100 - this.safeTotalBet,
			maxAmount
		);
		if (this.isDuoBaoPending) {
			const prevAw = this.prevSi?.aw || 0;
			return maxPrice - prevAw;
		}
		return maxPrice;
	}

	/**
	 * 根据权重随机获取是否中奖
	 * @param {Object} options - 配置参数
	 * @param {number} options.min - 选填，默认值为 0
	 * @param {number} options.max - 选填，默认值为 100
	 * @param {number} options.weight - 选填，默认值为 -1
	 * @returns {boolean} 是否中奖，随机出的数小于等于 weight 则认为中奖
	 */
	public randomWinner({
		min = 0,
		max = 100,
		weight = -1,
	}: {
		min?: number;
		max?: number;
		weight?: number;
	}) {
		if (weight < min || weight > max) return false;
		const count = random.int(min, max);
		return count <= weight;
	}

	/**
	 * 排除 rl 数据每一列的某个位置图标信息
	 * @param {Object} options - 配置参数
	 * @param {number[][]} options.rl - 待排除的 rl 数据
	 * @param {number} options.colIndex - 选填，默认值为 0。每一列的位置信息，默认排除每一列的第一个图标信息。如果传-1，则不会进行排除。
	 * @returns {number[][]} 排除后的数据
	 */
	public getRl3x5({ rl, colIndex = 0 }: { rl: number[][]; colIndex?: number }) {
		const cloneRl = cloneDeep(rl);
		return cloneRl.map((icons) =>
			icons.filter((_, index) => index !== colIndex)
		);
	}

	/**
	 * 蝶恋花的 wp3x5 字段信息
	 * @param {Object} options - 配置参数
	 * @param {Object} options.wp - wp 字段信息
	 * @param {number} options.colMinusCount - 每一列需要减掉的数量，默认每一列需要减去 1
	 * @param {number[][]} options.rl - rl 字段信息
	 * @returns {Object|null|undefined}
	 */
	public getWp3x5({
		wp,
		colMinusCount = 1,
		rl,
	}: {
		wp?: Record<string, number[]> | null;
		colMinusCount?: number;
		rl: number[][];
	}): Record<string, number[]> | null | undefined {
		if (isEmpty(wp)) return wp;
		const minusArr = rl.map((_, index) => (index + 1) * colMinusCount);
		return keys(wp).reduce((acc, winId) => {
			return {
				...acc,
				[winId]: wp[winId].map((pos, idx) => pos - minusArr[idx]),
			};
		}, {} as Record<string, number[]>);
	}

	/**
	 * 获取 lw 金额的总计
	 * @param {Object|undefined} lw - lw 信息
	 * @returns {number}
	 */
	public getTlw(lw?: Record<string, number> | null) {
		return BaseSlot._getCtw({ lw, gm: 1 });
	}
}
