/** 用户类型 */
export enum UserType {
	/** 试玩 */
	trail = 0,
	/** 新用户 */
	newuser = 1,
	/** 正常用户 */
	common = 2,
}

/** tw 计算方式 */
export enum TwCalculateType {
	/** 通用模式：lw 总计 * 倍率 */
	TW通用 = 0,
	/** 累计的倍数模式：本次中奖为 0，掉落的最后一次为累计金额 * 累计倍率 */
	TW累计 = 1,
}

/**
 * 给定 key 和 value，返回 key:value
 * @param {string[]} keys
 * @param {any} value
 * @returns {Record<string, any>} { [key]: value }
 */
export function toOutputVal<K extends string, V extends any>(
	keys: string[],
	val: V
) {
	return keys.reduce((acc, cur) => {
		acc[cur as K] = val;
		return acc;
	}, {} as Record<K, V>);
}

/**
 * 输出给定字段的值都为 null
 * @param {string[]} keys
 */
export function toBeNull<K extends string>(keys: string[]) {
	return toOutputVal<K, null>(keys, null);
}

export function toBeZero<K extends string>(keys: string[]) {
	return toOutputVal<K, 0>(keys, 0);
}
