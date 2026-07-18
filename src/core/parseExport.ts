import type { Account, ParsedExport } from "./types";

interface RawStringListEntry {
  href: string;
  value: string;
  timestamp: number;
}

interface RawRecord {
  string_list_data: RawStringListEntry[];
}

// Instagram wraps each relationship file's array in a single top-level key
// whose name varies by file (relationships_following, relationships_followers,
// relationships_follow_requests_sent, ...). Rather than hardcode every key
// name, find whichever property holds the array.
function extractRecords(json: unknown): RawRecord[] {
  if (Array.isArray(json)) {
    return json as RawRecord[];
  }
  if (json && typeof json === "object") {
    const arrayValue = Object.values(json).find((value) =>
      Array.isArray(value),
    );
    if (arrayValue) {
      return arrayValue as RawRecord[];
    }
  }
  return [];
}

function toAccounts(json: unknown): Account[] {
  return extractRecords(json).map((record) => {
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
  pendingJson: unknown;
}): ParsedExport {
  const following = toAccounts(input.followingJson);
  const followers = input.followersJsonFiles.flatMap(toAccounts);
  const pending = toAccounts(input.pendingJson);

  return { following, followers, pending };
}
