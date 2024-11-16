import { chunk, difference, uniq } from "lodash";
import random from "random";
import { RnsCalculateType } from "utils/helper";

export interface RnsAdapterOptions {
	/** 本局随机出来的 rl 数据 */
	rl: number[][];
	/** 上一次中奖的位置，通常代指 ptr、ptbr 等字段 */
	prevWinPos: number[];
	/** 每一列的长度 */
	colLength: number;
	/** 计算方式 */
	mode: RnsCalculateType;
	/** 上一局的rl数据 */
	prevRl: number[];
	/** 上一局的 trl 数据, 不传默认为空数组 */
	prevTrl?: number[];
}

export default class RnsAdapter {
	/** 本局 rns 数据 */
	public rns: number[][] = [];
	/** 所有列可以消费的图标 */
	public allColByIcons: number[] = [];
	/** 计算方式 */
	private readonly mode: RnsCalculateType;
	/** 新的 rl 数据 */
	private readonly newRl: number[][];

	constructor({ mode, rl, ...options }: RnsAdapterOptions) {
		this.mode = mode;
		this.newRl = rl;
		this.rns = rl.map((_) => []);
		this.adapterHandle(options);
	}

	private adapterHandle(options: Omit<RnsAdapterOptions, "mode" | "rl">) {
		return {
			[RnsCalculateType.RNS强控不中奖]: this.rnsNotWinner(options),
			[RnsCalculateType.RNS随机]: this.rnsRadom(options),
		}[this.mode];
	}

	private rnsNotWinner({
		prevRl,
		colLength,
		prevWinPos,
		prevTrl = [],
	}: Omit<RnsAdapterOptions, "mode" | "rl">) {
		const icons = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		const oldRl: number[][] = chunk(prevRl, colLength);
		// 拿到 old rl 的第二列。先不过滤掉中奖的图标了
		const preRlColumn2 = [...oldRl[1]];
		// 奖 trl 的图标全部排出
		preRlColumn2.push(...prevTrl);
		// 拿到第一列可以随机的图标信息
		const col1ByIcons = difference(icons, uniq(preRlColumn2));
		//  获取第一列消失的图标信息
		const delInColumn1 = prevWinPos.filter((idx) => idx < colLength);
		// 随机新的图标，填充第一列
		for (let row = 0; row < delInColumn1.length; row++) {
			const idx = random.int(0, col1ByIcons.length - 1);
			this.rns[0].push(col1ByIcons[idx]);
		}
		// 获取第一列未消失的图标
		const notRemoveByCol1 = oldRl[0].filter(
			(_, idx) => !delInColumn1.includes(idx)
		);
		// 拿到最新的 rl 第一列数据
		const newRlColumn1 = [...this.rns[0], ...notRemoveByCol1];
		// console.log("newRlColumn1", newRlColumn1);
		// 拿到后续所有列都能随机的图标
		const allColByIcons = difference(icons, newRlColumn1);
		// 填充后续所有列的图标
		prevWinPos.forEach((idx) => {
			const delIndex = Math.floor(idx / colLength);
			if (delIndex === 0) {
				return;
			}
			const iconIdx = random.int(0, allColByIcons.length - 1);
			this.rns[delIndex].push(allColByIcons[iconIdx]);
		});
		this.allColByIcons = allColByIcons;
	}

	/**
	 * rns 掉落纯随机逻辑
	 * @param {object} options 配置参数
	 * @param {number[]} options.prevWinPos 上一次中奖的位置，通常代指 ptr、ptbr 等字段
	 * @param {number} options.colLength 每一列的长度
	 * @param {number[][]} options.newRl 本局随机出来的 rl 数据
	 */
	private rnsRadom({
		prevWinPos,
		colLength,
	}: Omit<RnsAdapterOptions, "mode" | "rl">) {
		prevWinPos.forEach((idx) => {
			const delIndex = Math.floor(idx / colLength);
			this.rns[delIndex].push(this.newRl[delIndex][idx - delIndex * colLength]);
		});
	}
}
