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
	common = 0,
	/** 累计的倍数模式：本次中奖为 0，掉落的最后一次为累计金额 * 累计倍率 */
	grandTotal = 1,
}
