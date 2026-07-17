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

    const result = computeViews({ following, followers, pending: [] });

    expect(result.notFollowingBack).toEqual([account("alice"), account("carol")]);
  });

  it("returns an empty list when following is empty", () => {
    const result = computeViews({
      following: [],
      followers: [account("bob")],
      pending: [],
    });

    expect(result.notFollowingBack).toEqual([]);
  });

  it("returns the full following list when followers is empty", () => {
    const following = [account("alice"), account("bob")];

    const result = computeViews({ following, followers: [], pending: [] });

    expect(result.notFollowingBack).toEqual(following);
  });

  it("returns fans: accounts that follow but aren't followed back", () => {
    const following = [account("bob")];
    const followers = [account("alice"), account("bob"), account("carol")];

    const result = computeViews({ following, followers, pending: [] });

    expect(result.fans).toEqual([account("alice"), account("carol")]);
  });

  it("returns mutuals: accounts in both following and followers", () => {
    const following = [account("alice"), account("bob")];
    const followers = [account("bob"), account("carol")];

    const result = computeViews({ following, followers, pending: [] });

    expect(result.mutuals).toEqual([account("bob")]);
  });

  it("returns pending as the pending-sent-requests list passed through", () => {
    const pending = [account("dana")];

    const result = computeViews({ following: [], followers: [], pending });

    expect(result.pending).toEqual(pending);
  });

  it("returns empty lists for all four views when everything is empty", () => {
    const result = computeViews({ following: [], followers: [], pending: [] });

    expect(result).toEqual({
      notFollowingBack: [],
      fans: [],
      mutuals: [],
      pending: [],
    });
  });
});
