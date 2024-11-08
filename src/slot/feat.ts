import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";

export default class ClassFeatSlot extends BaseSlot {
	constructor(options: BaseSlotOptions) {
		super(options);
	}
	/** 获取倍率相关信息 */
	public getMf({
		gsp,
		prevMf,
	}: {
		gsp: number[];
		prevMf?: Record<string, number>;
	}): Record<string, number> {
		return gsp.reduce((acc, key) => {
			return {
				...acc,
				[key]: random.int(0, 20),
			};
		}, {} as Record<string, number>);
	}
}
