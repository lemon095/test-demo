import type { Decimal } from "@prisma/client/runtime/library";

export interface MoneyPoolMachine {
	betLevel: number;
	operatorId: number;
	level: number;
	gameID: number;
	totalIn?: Decimal;
	totalOut?: Decimal;
	maxRtp: Decimal;
	updatedAt?: Date;
	channel: string;
}
