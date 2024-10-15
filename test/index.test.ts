import { test, expect } from "bun:test";
import BaseSlot from "..";
test("is not win over 15", () => {
  expect(new BaseSlot().isNotWinOver15(-1)).toBeFalsy();
  expect(new BaseSlot().isNotWinOver15(0)).toBeFalsy();
  expect(new BaseSlot().isNotWinOver15(1)).toBeFalsy();
  expect(new BaseSlot().isNotWinOver15(15)).toBeTrue();
  expect(new BaseSlot().isNotWinOver15(16)).toBeTrue();
});
test("is pre win", () => {
  expect(new BaseSlot().isPreWin({})).toBeFalse();
  expect(new BaseSlot().isPreWin(null)).toBeFalse();
  expect(new BaseSlot().isPreWin()).toBeFalse();
  expect(new BaseSlot().isPreWin({ 1: [1, 2, 3] })).toBeTrue();
});
test("is DuoBao pending", () => {
  expect(new BaseSlot().isDuoBaoPending({})).toBeFalse();
});
