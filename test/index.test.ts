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
