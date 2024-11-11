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
	 * 墨西哥：get ir 中奖时为 true，未中奖为 false
	 */
	public getIr() {
		return this.isPreWin;
	}

	/**
	 * 墨西哥 ptr: 获取非金框下的数值
	 */
	public getPtrBy1492288({
		wp,
		gsp,
	}: {
		gsp: number[];
		wp?: Record<string, any> | null;
	}) {
		if (isEmpty(wp)) return [];
		const innerWp = cloneDeep(wp);
		const wpValues = flattenDeep(values(innerWp));
		return wpValues.filter((v) => !gsp.includes(v));
	}

	/**
	 * 墨西哥 wsp: 获取金框下的数值
	 */
	public getWspBy1492288({
		gsp,
		wp,
	}: {
		gsp: number[];
		wp?: Record<string, number[]> | null;
	}): number[] {
		if (isEmpty(wp)) return [];
		const innerWp = cloneDeep(wp);
		const wpValues = flattenDeep(values(innerWp));
		return wpValues.filter((v) => gsp.includes(v));
	}
}
