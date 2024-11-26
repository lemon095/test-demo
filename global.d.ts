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
}
