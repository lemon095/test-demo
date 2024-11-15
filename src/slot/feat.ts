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
}
