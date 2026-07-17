import { describe, expect, it } from "vitest";
import { applyIgnoreList } from "./applyIgnoreList";
import type { Account } from "./types";

const account = (username: string): Account => ({
  username,
  profileUrl: `https://www.instagram.com/${username}`,
  timestamp: 1614556800,
});

describe("applyIgnoreList", () => {
  it("filters out accounts whose username is in the ignored set", () => {
    const accounts = [account("alice"), account("bob"), account("carol")];
    const ignored = new Set(["bob"]);

    const result = applyIgnoreList(accounts, ignored);

    expect(result).toEqual([account("alice"), account("carol")]);
  });

  it("is a no-op when the ignored set is empty", () => {
    const accounts = [account("alice"), account("bob")];

    const result = applyIgnoreList(accounts, new Set());

    expect(result).toEqual(accounts);
  });

  it("un-ignoring (removing a username from the set) makes the account reappear", () => {
    const accounts = [account("alice"), account("bob")];
    const ignored = new Set(["bob"]);
    ignored.delete("bob");

    const result = applyIgnoreList(accounts, ignored);

    expect(result).toEqual(accounts);
  });
});
