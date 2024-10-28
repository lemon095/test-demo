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

/** 用户类型 */
export enum UserType {
	/** 试玩 */
	trail = 0,
	/** 新用户 */
	newuser = 1,
	/** 正常用户 */
	common = 2,
}

/** 用户操作 */
export enum GameOperate {
	/** 小鸡在左侧 */
	left = 1,
	/** 小鸡在右侧 */
	right = 2,
	/** 开始游戏 */
	start_play = 3,
	/** 游戏胜利/领奖 */
	winner_paly = 4,
}

/** 车（物体）的位置 */
export enum CarPos {
	/** 车在左侧 */
	left = 2,
	/** 车在右侧 */
	right = 1,
}

export interface BaseChickyParams {
	/** 用户行为 */
	ps: GameOperate;
	/** 金币模式信息 */
	ib: boolean;
	/** 投注额 */
	cs: number;
	/** 投注线 */
	ml: number;
}

export default class BaseChicky {
	public readonly ps: GameOperate;
	public readonly ib: boolean;
	public readonly cs: number;
	public readonly ml: number;
	public readonly totalBet: number;

	/**
	 * base Chicky 构造器
	 * @param {Object} options - 配置选项
	 * @param {GameOperate} options.ps 必填，用户的操作信息
	 * @param {boolean} options.ib 必填，是否为金币模式
	 * @param {boolean} options.cs 必填，投注额
	 * @param {boolean} options.ml 必填，投注线
	 */
	constructor({ ps, ib, cs, ml }: BaseChickyParams) {
		this.ps = ps;
		this.ib = ib;
		this.cs = cs;
		this.ml = ml;
		this.totalBet = new Decimal(cs).mul(ml).toNumber();
	}

	/**
	 * 是否为金币模式
	 * @returns {boolean} true:金币模式，false:非金币模式
	 */
	public get isGlod(): boolean {
		return this.ib;
	}

	public testFn() {
		const result = this.convertWeights([
			{ icon: 0, weight: 22 },
			{ icon: 1, weight: 59 },
			{ icon: 2, weight: 18 },
			{ icon: 3, weight: 1 },
		]);
		console.log(result);
		return "test";
	}

	/**
	 * 上一局是否赢
	 * @returns {boolean} true:赢，false:输
	 */
	public get isPrevWin(): boolean {
		return this.isCurrentWin(CarPos.left, GameOperate.left);
	}

	/**
	 * 本局是否输赢
	 * @param {CarPos} 车的位置
	 * @param {GameOperate} 小鸡的位置，选填。不填则为当局游戏的小鸡位置
	 * @returns {boolean} true:赢，false:输
	 */
	public isCurrentWin(carPos: CarPos, ps = this.ps) {
		if (ps === GameOperate.left && carPos === CarPos.left) return true;
		if (ps === GameOperate.right && carPos === CarPos.right) return true;
		return false;
	}
	/**
	 * 随机车的位置
	 * @returns {CarPos} 左二右一
	 */
	public getRR(): CarPos {
		const r = random.int(CarPos.left, CarPos.right);
		return r;
	}
	/**
	 * 将权重配置转为权重表
	 * @param {PGSlot.WeightCfg[]} weights - 权重配置信息
	 * @returns 权重表数据
	 */
	public convertWeights(weights: PGSlot.WeightCfg[]): number[] {
		return flatMapDeep(
			weights.map((item) => Array(item.weight).fill(item.icon))
		);
	}
}
