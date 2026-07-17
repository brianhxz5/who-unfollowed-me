import type { Account, ParsedExport } from "./types";

interface RawStringListEntry {
  href: string;
  value: string;
  timestamp: number;
}

interface RawRecord {
  string_list_data: RawStringListEntry[];
}

interface FollowingExport {
  relationships_following: RawRecord[];
}

function toAccounts(records: RawRecord[]): Account[] {
  return records.map((record) => {
    const entry = record.string_list_data[0];
    return {
      username: entry.value,
      profileUrl: entry.href,
      timestamp: entry.timestamp,
    };
  });
}

export function parseExport(input: {
  followingJson: unknown;
  followersJsonFiles: unknown[];
}): ParsedExport {
  const followingJson = input.followingJson as FollowingExport;
  const following = toAccounts(followingJson.relationships_following);

  const followers = (input.followersJsonFiles as RawRecord[][]).flatMap(
    toAccounts,
  );

  return { following, followers };
}
