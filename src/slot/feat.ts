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

	test() {
		[
			{
				gwt: -1,
				np: 0,
				orl: [8, 5, 10, 10, 4, 4, 10, 6, 3, 0, 7, 3, 3, 7, 7, 3, 8, 3, 5, 8],
				rl: [8, 5, 10, 10, 4, 4, 10, 6, 3, 0, 7, 3, 3, 7, 7, 3, 8, 3, 5, 8],
				ctw: 0.8,
				cwc: 2,
				tw: 0,
				tb: 0,
				aw: 0,
				cgsp: [],
				ngsp: null,
				ssaw: 4.8,
				gsp: [6, 9, 12, 15],
				wsp: [6],
				wp: { "5": [3, 6, 9], "12": [2, 6, 9] },
				rwsp: { "5": 2, "12": 2 },
				lw: { "5": 0.4, "12": 0.4 },
				gm: 7,
				fs: null,
				fstc: { "4": 1 },
				rns: [[8], [4], [], [], []],
				ge: [1, 3, 11],
				mf: { "6": 5, "9": 2, "12": 2, "15": 3 },
				nst: 4,
				st: 4,
				cgm: 5,
				ir: true,
				ptr: [2, 3, 9],
				sc: 0,
				fb: null,
			},
			{
				gwt: 2,
				np: 33.6,
				orl: [5, 8, 8, 5, 4, 4, 0, 6, 3, 3, 7, 3, 3, 7, 7, 3, 8, 3, 5, 8],
				rl: [5, 8, 8, 5, 4, 4, 0, 6, 3, 3, 7, 3, 3, 7, 7, 3, 8, 3, 5, 8],
				ctw: 0,
				cwc: 0,
				tw: 33.6,
				tb: 0,
				aw: 33.6,
				cgsp: [],
				ngsp: null,
				ssaw: 4.8,
				gsp: [6, 12, 15],
				wsp: null,
				wp: null,
				rwsp: null,
				lw: null,
				gm: 7,
				fs: null,
				fstc: { "4": 2 },
				rns: [[5, 8], [], [3], [], []],
				ge: [1, 3, 11],
				mf: { "6": 5, "12": 2, "15": 3 },
				nst: 1,
				st: 4,
				cgm: 0,
				ir: false,
				ptr: null,
				sc: 0,
				fb: null,
			},
		];
	}
}
