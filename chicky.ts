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

export enum UserType {
	/** 试玩 */
	trail = 0,
	/** 新用户 */
	newuser = 1,
	/** 正常用户 */
	common = 2,
}

export default class BaseChicky {
	public testFn() {
		const result = this.convertWeights([
			{ icon: 0, weight: 22 },
			{ icon: 1, weight: 59 },
			{ icon: 2, weight: 18 },
			{ icon: 3, weight: 1 },
		]);
		console.log(result);
		return "test";
	}
	/**
	 * 随机车的位置
	 * @returns {number} 左二右一
	 */
	public getRR(): 1 | 2 {
		const r = random.int(1, 2);
		return r as 1 | 2;
	}
	/**
	 * 将权重配置转为权重表
	 * @param {PGSlot.WeightCfg[]} weights - 权重配置信息
	 * @returns 权重表数据
	 */
	public convertWeights(weights: PGSlot.WeightCfg[]): number[] {
		return flatMapDeep(
			weights.map((item) => Array(item.weight).fill(item.icon))
		);
	}
}
