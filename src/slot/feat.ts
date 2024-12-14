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
				rl: [
					8, 11, 1, 3, 8, 5, 0, 2, 5, 5, 5, 11, 12, 12, 5, 8, 8, 1, 5, 2, 11, 6,
					6, 6, 6, 11, 12, 4, 11, 5,
				],
				orl: [
					8, 11, 1, 3, 8, 5, 0, 2, 5, 5, 5, 11, 12, 12, 5, 8, 8, 1, 5, 2, 11, 6,
					6, 6, 6, 11, 12, 4, 11, 5,
				],
				trl: [8, 8, 8, 5],
				torl: [8, 8, 8, 5],
				ebb: {
					"1": {
						fp: 12,
						lp: 13,
						bt: 2,
						ls: 1,
					},
					"2": {
						fp: 15,
						lp: 16,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 21,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
				wp: {
					"8": [0, 4, 6, 15, 16],
					"11": [1, 6, 11],
				},
				twp: {
					"8": [0, 1, 2, 0, 1, 2],
				},
				eb: {
					"1": {
						fp: 12,
						lp: 13,
						bt: 2,
						ls: 1,
					},
					"3": {
						fp: 21,
						lp: 24,
						bt: 2,
						ls: 1,
					},
				},
				esb: {
					"1": [12, 13],
					"2": [15, 16],
					"3": [21, 22, 23, 24],
				},
				es: {
					"1": [12, 13],
					"3": [21, 22, 23, 24],
				},
				tptbr: [0, 1, 2],
				snww: {
					"8": 36,
					"11": 1,
				},
				nowpr: [5, 6, 5, 5, 3, 5],
				pcwc: 1,
				fstc: null,
				st: 1,
				gt: null,
				nst: 4,
				cwc: 1,
				lw: {
					"8": 4.32,
					"11": 0.02,
				},
				tw: 4.34,
				ctw: 4.34,
				gwt: 2,
				rwsp: {
					"8": 6,
					"11": 1,
				},
				fs: null,
				aw: 4.34,
				tb: 0.4,
				np: 3.94,
				now: 11250,
				bwp: {
					"8": [[0], [4], [6], [15, 16]],
					"11": [[1], [6], [11]],
				},
				ptbr: [0, 1, 4, 6, 11, 15, 16],
				rs: null,
				ssaw: 4.34,
				ge: [1, 11],
				_$_$_: {
					wlc: {
						"8": 4,
						"11": 3,
					},
					sc: 2,
					gm: 1,
				},
				tbb: 0.4,
				ml: 1,
				cs: 0.02,
				pf: 2,
				wk: "0_C",
				wt: "C",
				hashr:
					"0:8;3;0#11;8;2#1;5;5#R#8#0011205051#R#11#012032#MV#0.4#MT#1#MG#4.3#",
				psid: "302541561440504867",
				sid: "302541561440504867",
				bl: 9999995.76,
				blab: 9999991.42,
				blb: 9999991.82,
				mr: null,
				ocr: null,
				wfg: null,
				wbn: null,
				pmt: null,
				wid: 0,
			},
		];
	}
}
