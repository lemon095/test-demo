import { flatMapDeep, isArray, isEmpty, isNumber, values } from "lodash";
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
	 * 是否未夺宝流程
	 * @param {Object} options - 配置选项
	 * @param {Object} options.preFs - 上一次的 fs 信息
	 * @param {Object} options.preWp - 选填，上一次的 wp 信息
	 */
	public isDuoBaoPending({
		preFs,
		preWp,
	}: Partial<{
		preFs: Record<string, any> | null;
		preWp: Record<string, any> | null;
	}>) {
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
	 * @param {number} options.tgmByIcon 必填，当前图标id 如果图标id 2 对应倍数信息，那么给 2
	 * @param {array} [options.preTmd] 上一次的 tmd 信息
	 * @param {object} [options.twp] 当前trl中的中奖信息
	 * @param {array} [options.trns] 当前trl的掉落图标信息
	 * @param {array} [options.tgmWeight] 倍数权重表
	 * @returns {array} tmd 倍数信息
	 */
	public getTmd({
		icons,
		tgmByIcon,
		preTmd,
		twp,
		trns,
		tgmWeight,
	}: {
		icons: number[];
		tgmByIcon: number;
		preTmd?: [number, number][];
		twp?: Record<string, number[]>;
		trns?: number[];
		tgmWeight: number[];
	}): [number, number][] {
		if (!isEmpty(twp) && !isEmpty(preTmd) && !isEmpty(trns)) {
			// 掉落下的图标倍数信息
			// 获取删除的位置信息
			const delPoss = flatMapDeep(values(twp));
			// 先修改 preTmd 的位置信息
			const currentTmd = preTmd!.map(([pos, tgm]) => {
				const len = delPoss.filter((delPos) => delPos < pos).length;
				return [pos - len, tgm];
			}) as [number, number][];
			// 再获取新生成的 图标位置信息
			const newTmd = trns!
				.map((icon, index) => {
					if (icon === tgmByIcon) {
						return [
							icons.length - trns!.length + index,
							this.getRandomTgmByIcon(tgmWeight),
						];
					}
					return null;
				})
				.filter((item) => item) as [number, number][];
			return [...currentTmd!, ...newTmd];
		}
		const newTmd = icons!
			.map((icon, index) => {
				if (icon === tgmByIcon) {
					return [index, this.getRandomTgmByIcon(tgmWeight)];
				}
				return null;
			})
			.filter((item) => item) as [number, number][];
		return newTmd;
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
}
