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
	}): number[] | null {
		if (isEmpty(wp)) return null;
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
	}): number[] | null {
		if (isEmpty(wp)) return null;
		const innerWp = cloneDeep(wp);
		const wpValues = flattenDeep(values(innerWp));
		return wpValues.filter((v) => gsp.includes(v));
	}

	/**
	 * 墨西哥：ge 计算
	 * @description 不是通用的计算方式
	 * @param {Object} options - 配置项
	 * @param {Object|null} options.wp - 中奖图标信息
	 * @param {Object|null} options.wsp - 中奖图标的金框位置
	 * @param {Object|null} options.mf - 金框对应的倍率信息
	 * @param {number} options.st - 当前游戏的模式
	 * @return {number[]} 游戏模式信息
	 */
	public getGeBy1492288({
		wsp,
		mf,
		st,
		wp,
	}: {
		st: number;
		wp?: Record<string, number[]> | null;
		wsp?: number[] | null;
		mf?: Record<string, number> | null;
	}): number[] {
		const ge = [11];
		// 是否存在消除的金框倍率信息
		const isGlod = wsp?.some((pos) => (mf?.[pos] ?? 0) > 0);
		const isCurrentWinner = !isEmpty(wp);
		const prevGlod: boolean = this.prevSi?.ge?.some(
			(item: number) => item === 3
		);
		// 夺宝模式
		if (st > 4) {
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
	 * @param {number} st 当前游戏的模式信息
	 * @returns {number[]} 当前游戏的模式信息
	 */
	public getGe(st: number): number[] {
		if (st > 4) {
			return [2, 11];
		}
		return [1, 11];
	}
}
