declare namespace PGSlot {
	type UserType = import("utils/helper").UserType;
	type RandomWeights = Record<UserType, WeightCfg[][]>;
	interface WeightCfg {
		/** 图标id */
		icon: number;
		/** 图标对应的权重 */
		weight: number;
	}
	interface Ebb {
		/** 起始位置 */
		fp: number;
		/** 结束位置 */
		lp: number;
		bt: number;
		ls: number;
	}

	interface RS {
		espt: Record<string, { op: number[]; np: number[] }>;
		esst: Record<string, { os: number; ns: number }>;
		rns: number[][];
		trns: number[];
		bewb: Record<string, Ebb>;
	}
}
