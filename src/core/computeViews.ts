import type { Account, ParsedExport } from "./types";

export interface Views {
  notFollowingBack: Account[];
  fans: Account[];
  mutuals: Account[];
  pending: Account[];
}

export function computeViews(data: ParsedExport): Views {
  const followerUsernames = new Set(data.followers.map((a) => a.username));
  const followingUsernames = new Set(data.following.map((a) => a.username));

  const notFollowingBack = data.following.filter(
    (a) => !followerUsernames.has(a.username),
  );
  const fans = data.followers.filter(
    (a) => !followingUsernames.has(a.username),
  );
  const mutuals = data.following.filter((a) =>
    followerUsernames.has(a.username),
  );

  return { notFollowingBack, fans, mutuals, pending: data.pending };
}
