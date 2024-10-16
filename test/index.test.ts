import { test, expect } from "bun:test";
import BaseSlot from "..";
const slot = new BaseSlot();
test("is not win over 15", () => {
	expect(slot.isNotWinOver15(-1)).toBeFalsy();
	expect(slot.isNotWinOver15(0)).toBeFalsy();
	expect(slot.isNotWinOver15(1)).toBeFalsy();
	expect(slot.isNotWinOver15(15)).toBeTrue();
	expect(slot.isNotWinOver15(16)).toBeTrue();
});
test("is pre win", () => {
	expect(slot.isPreWin({})).toBeFalse();
	expect(slot.isPreWin(null)).toBe(false);
	expect(slot.isPreWin()).toBeFalse();
	expect(slot.isPreWin({ 1: [1, 2, 3] })).toBeTrue();
});
test("is DuoBao pending", () => {
	expect(slot.isDuoBaoPending({})).toBeFalse();
	expect(slot.isDuoBaoPending({ preFs: { s: 0, ts: 10 } })).toBeFalse();
	expect(slot.isDuoBaoPending({ preFs: { s: null } })).toBeUndefined();
	expect(slot.isDuoBaoPending({ preFs: { s: 1, ts: 10 } })).toBeTrue();
	expect(slot.isDuoBaoPending({ preFs: { s: 10, ts: 10 } })).toBeTrue();
	expect(
		slot.isDuoBaoPending({ preFs: { s: 2, ts: 10 }, preWp: { 1: [1, 2, 3] } })
	).toBeTrue();
	expect(
		slot.isDuoBaoPending({ preFs: { s: 10, ts: 10 }, preWp: { 1: [1, 2, 3] } })
	).toBeFalse();
});
test("random tgm", () => {
	expect(slot.getRandomTgmByIcon([2])).toBe(2);
	expect(slot.getRandomTgmByIcon([3, 3])).toBe(3);
});
test("tmd computed", () => {
	expect(
		slot.getTmd({
			icons: [6, 8, 2, 6],
			preTmd: [[3, 2]],
			twp: { 9: [0] },
			trns: [6],
			tgmByIcon: 2,
			tgmWeight: [2, 3],
		})
	).toEqual([[2, 2]]);
	expect(
		slot.getTmd({
			icons: [6, 8, 2, 6],
			preTmd: [[2, 2]],
			twp: { 9: [3] },
			trns: [6],
			tgmByIcon: 2,
			tgmWeight: [2, 3],
		})
	).toEqual([[2, 2]]);
	expect(
		slot.getTmd({
			icons: [6, 2, 4, 6],
			preTmd: [[1, 2]],
			twp: { 9: [2, 3] },
			trns: [6, 3],
			tgmByIcon: 2,
			tgmWeight: [2, 2],
		})
	).toEqual([
		[1, 2],
		[2, 2],
	]);
	// 测试用例处理
});
