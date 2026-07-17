import { describe, expect, it } from "vitest";
import { filterAndSort } from "./filterAndSort";
import type { Account } from "./types";

const account = (username: string, timestamp: number): Account => ({
  username,
  profileUrl: `https://www.instagram.com/${username}`,
  timestamp,
});

describe("filterAndSort", () => {
  it("filters accounts by case-insensitive username substring match", () => {
    const accounts = [
      account("Alice", 1),
      account("bob", 2),
      account("alicia", 3),
    ];

    const result = filterAndSort(accounts, { search: "ali", sortBy: "username" });

    expect(result).toEqual([account("Alice", 1), account("alicia", 3)]);
  });

  it("sorts by username A-Z, case-insensitively", () => {
    const accounts = [account("carol", 1), account("Alice", 2), account("bob", 3)];

    const result = filterAndSort(accounts, { search: "", sortBy: "username" });

    expect(result).toEqual([account("Alice", 2), account("bob", 3), account("carol", 1)]);
  });

  it("sorts by relationship date, oldest first (independent of alphabetical order)", () => {
    const accounts = [account("alice", 300), account("carol", 100), account("bob", 200)];

    const result = filterAndSort(accounts, { search: "", sortBy: "date" });

    expect(result).toEqual([account("carol", 100), account("bob", 200), account("alice", 300)]);
  });
});
