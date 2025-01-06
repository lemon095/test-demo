import { Decimal } from "@prisma/client/runtime/library";
import type { MoneyPoolMachine } from "models/types";

export class GameMoneyPoolService {
	public static async getProfit(keyParams: MoneyPoolMachine) {
		return new Decimal(0);
	}
}
