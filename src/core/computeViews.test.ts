import { describe, expect, it } from "vitest";
import { computeViews } from "./computeViews";
import type { Account } from "./types";

const account = (username: string): Account => ({
  username,
  profileUrl: `https://www.instagram.com/${username}`,
  timestamp: 1614556800,
});

describe("computeViews", () => {
  it("returns accounts followed but not following back", () => {
    const following = [account("alice"), account("bob"), account("carol")];
    const followers = [account("bob")];

    const result = computeViews({ following, followers });

    expect(result.notFollowingBack).toEqual([account("alice"), account("carol")]);
  });

  it("returns an empty list when following is empty", () => {
    const result = computeViews({ following: [], followers: [account("bob")] });

    expect(result.notFollowingBack).toEqual([]);
  });

  it("returns the full following list when followers is empty", () => {
    const following = [account("alice"), account("bob")];

    const result = computeViews({ following, followers: [] });

    expect(result.notFollowingBack).toEqual(following);
  });
});
