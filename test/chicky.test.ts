import { expect, describe, it } from "bun:test";
import BaseChicky, { UserType } from "../chicky";
import { chunk } from "lodash";
const slot = new BaseChicky();

describe("chicky test", () => {
  it("test", () => {
    expect(slot.testFn()).toBe("test");
  });
});
