declare namespace PGSlot {
	type UserType = import(".").UserType;
	type RandomWeights = Record<UserType, WeightCfg[][]>;
	interface WeightCfg {
		/** 图标id */
		icon: number;
		/** 图标对应的权重 */
		weight: number;
	}
}
