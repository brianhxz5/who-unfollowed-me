import type { Account, ParsedExport } from "./types";

export interface Views {
  notFollowingBack: Account[];
}

export function computeViews(data: ParsedExport): Views {
  const followerUsernames = new Set(data.followers.map((a) => a.username));
  const notFollowingBack = data.following.filter(
    (a) => !followerUsernames.has(a.username),
  );

  return { notFollowingBack };
}
