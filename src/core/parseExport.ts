import type { Account, ParsedExport } from "./types";

interface RawStringListEntry {
  href?: string;
  value?: string;
  timestamp?: number;
}

interface RawRecord {
  string_list_data?: RawStringListEntry[];
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
  const accounts: Account[] = [];
  for (const record of extractRecords(json)) {
    const entry = record?.string_list_data?.[0];
    // Skip malformed/partial records: real exports occasionally include
    // entries with an empty string_list_data or a missing username. These
    // can't become a usable profile row, and letting them through emits an
    // account with an undefined username that later crashes rendering.
    if (!entry || typeof entry.value !== "string") {
      continue;
    }
    accounts.push({
      username: entry.value,
      profileUrl: typeof entry.href === "string" ? entry.href : "",
      timestamp: typeof entry.timestamp === "number" ? entry.timestamp : 0,
    });
  }
  return accounts;
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
