import Decimal from "decimal.js";
import {
	flatMapDeep,
	flatten,
	isArray,
	isEmpty,
	isNumber,
	keys,
	values,
} from "lodash";
import random from "random";
export default class BaseSlot {
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
	public isPreWin(preWp?: Record<string, number[]> | null): boolean {
		return !isEmpty(preWp);
	}

	/**
	 * 是否为夺宝流程
	 * @param {Object} options - 配置选项
	 * @param {object} options.preFs - 上一次的 fs 信息
	 * @param {object} options.preWp - 选填，上一次的 wp 信息
	 * @returns {boolean|undefined} 是否为夺宝流程
	 */
	public isDuoBaoPending({
		preFs,
		preWp,
	}: {
		preFs?: Record<string, any> | null;
		preWp?: Record<string, any> | null;
	}) {
		if (isEmpty(preFs)) return false;
		const fs = preFs;
		// 如果上一次的 s === fs 并且上一次有中奖，则表示还未进夺宝流程
		if (fs?.s === fs?.ts && this.isPreWin(preWp)) return false;
		if (isNumber(fs?.s)) {
			// 上一次中奖... 那么当前就是 free game
			if (this.isPreWin(preWp)) return true;
			// 大于零，表示还有次数
			if (fs.s > 0) return true;
			// 如果上一次为 0，并且上一次未中奖，则表示当前这次位夺宝结束后的第一次
			if (fs.s === 0) return false;
		}
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
	 * @param {array} [options.preTmd] 上一次的 tmd 信息
	 * @param {object} [options.twp] 当前trl中的中奖信息
	 * @param {array} [options.trns] 当前trl的掉落图标信息
	 * @param {array} [options.weights] 倍数权重表
	 * @returns {array} tmd 倍数信息
	 */
	public getTmd({
		icons,
		gmByIcon,
		preTmd,
		twp,
		trns,
		weights,
	}: {
		icons: number[];
		gmByIcon: number;
		weights: number[];
		preTmd?: [number, number][] | null;
		twp?: Record<string, number[]> | null;
		trns?: number[] | null;
	}): [number, number][] | null {
		if (!isEmpty(twp) && !isEmpty(trns)) {
			// 掉落下的图标倍数信息
			// 获取删除的位置信息
			const delPoss = flatMapDeep(values(twp));
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
	 * @param {object} options.bwp 当前rl中的中奖信息
	 * @param {object} options.rns 当前rl的掉落图标信息
	 * @param {array} options.weights 倍数权重表
	 */
	public getMd({
		icons,
		gmByIcon,
		preMd,
		bwp,
		rns,
		weights,
		ebb,
	}: {
		icons: number[][];
		gmByIcon: number;
		weights: number[];
		ebb?: Record<string, { fp: number; lp: number; bt: number; ls: number }>;
		preMd?: [number, number][] | null;
		bwp?: Record<string, number[]> | null;
		rns?: number[][] | null;
	}): [number, number][] | null {
		// 非掉落下的图标倍数信息
		if (isEmpty(bwp) || isEmpty(rns)) {
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
									mds.push([idx, this.getRandomTgmByIcon(weights)]);
									breakCount = bordered.lp - bordered.fp;
								} else {
									breakCount -= 1;
								}
							} else {
								mds.push([idx, this.getRandomTgmByIcon(weights)]);
							}
						}
						idx = idx + 1;
					}
					return mds.filter(isArray);
				})
			);
			return isEmpty(result) ? null : result;
		}
		// 掉落下的图标倍数信息
		return [];
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
	 * @param {Object} options.oldWp 上一次次的中奖图标：对应索引位置
	 * @param {number} options.oldAcw 上一次的中奖金额
	 */
	public getAcw({
		lw,
		wp,
		oldWp,
		oldAcw,
	}: {
		lw?: Record<string, number> | null;
		oldWp?: Record<string, number[]> | null;
		wp?: Record<string, number[]> | null;
		oldAcw: number;
	}): number {
		let amount = new Decimal(0);
		if (!this.isPreWin(oldWp)) {
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
}
