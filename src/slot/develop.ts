import random from "random";
import BaseSlot, { type BaseSlotOptions } from ".";
import { chunk, isEmpty, isNull, keys, toNumber, union } from "lodash";

export default class ClassDevelopSlot extends BaseSlot<any> {
	constructor(options: BaseSlotOptions<any>) {
		super(options);
	}
}
