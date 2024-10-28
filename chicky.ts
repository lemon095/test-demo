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
}
