import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";
import { keys, toNumber, union, valuesIn } from "lodash";

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
	}: {
		gsp?: number[];
		prevMf?: Record<string, number>;
	}): Record<string, number> {
		const prevPos = keys(prevMf).map(toNumber);
		const currentPos = union(gsp, prevPos);
		return currentPos.reduce((acc, key) => {
			const gm = prevMf?.[key] ?? random.int(0, 20);
			return {
				...acc,
				[key]: gm,
			};
		}, {} as Record<string, number>);
	}
}
