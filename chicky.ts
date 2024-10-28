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
}
