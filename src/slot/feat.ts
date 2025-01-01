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
	initial,
	isArray,
	isEmpty,
	isFunction,
	isNull,
	isNumber,
	isObject,
	keys,
	last,
	tail,
	toNumber,
	union,
	uniq,
	uniqBy,
	values,
} from "lodash";
import {
	TwCalculateType,
	RnsCalculateType,
	PcwcCalculateType,
} from "utils/helper";
import Decimal from "decimal.js";

export default class ClassFeatSlot extends BaseSlot<any> {
	constructor(options: BaseSlotOptions<any>) {
		super(options);
	}
	private testCount = 0;

	public async getSpinSi(mode?: "noPrize") {
		return new Promise<Record<string, any>>((resolve, reject) => {
			this.testCount += 1;
			setTimeout(() => {
				if (this.testCount > 5) {
					resolve({ c: this.testCount });
				} else {
					resolve({ wp: { 1: [1, 2, 3] }, c: this.testCount });
				}
			}, 300);
		});
	}

	public async loopSpin(result: Record<string, any>[], mode?: "noPrize") {
		const controlSi = await this.getSpinSi(mode);
		result.push(controlSi);
		if (isEmpty(controlSi.wp)) return;
		await this.loopSpin(result, mode);
	}
	public async collectSpinResult(mode?: "noPrize") {
		const spinResult: Record<string, any>[] = [];
		await this.loopSpin(spinResult, mode);
		return spinResult;
	}
	diaoluoSi(mode?: boolean): Record<string, any> {
		const isAgain = !mode;
		console.log("isAgain", isAgain);
		if (isAgain) {
			return this.diaoluoSi(true);
		}
		return { wp: mode ? null : { 1: [1, 2, 3] } };
	}

	/** aw 计算 */
	public getAw({
		tw,
		prevAw,
		isPreWin = false,
		isDuoBaoPending = false,
	}: {
		tw?: number;
		prevAw?: number;
		isPreWin: boolean;
		isDuoBaoPending: boolean;
	}): number {
		const aw = new Decimal(tw || 0);
		if (isDuoBaoPending || isPreWin) {
			return aw.add(prevAw || 0).toNumber();
		}
		return aw.toNumber();
	}
}
