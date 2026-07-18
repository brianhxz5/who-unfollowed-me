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

// Instagram's export is inconsistent between files: followers entries carry the
// username in `value`, but following entries often omit `value` entirely and
// only provide the profile `href` (https://www.instagram.com/<username>). Pull
// the username from the href's last path segment as a fallback.
function usernameFromHref(href: string): string {
  let path = href;
  try {
    path = new URL(href).pathname;
  } catch {
    // Not a fully-qualified URL — fall through and treat the raw string as a path.
  }
  const segment = path.split("/").filter(Boolean).pop();
  return segment ? segment.trim() : "";
}

function toAccounts(json: unknown): Account[] {
  const accounts: Account[] = [];
  for (const record of extractRecords(json)) {
    const entry = record?.string_list_data?.[0];
    if (!entry) {
      continue;
    }

    const href = typeof entry.href === "string" ? entry.href : "";
    const username =
      typeof entry.value === "string" && entry.value.trim()
        ? entry.value.trim()
        : href
          ? usernameFromHref(href)
          : "";

    // Skip records we can't turn into a usable profile row — without a username
    // there's nothing to link to, and an undefined username later crashes
    // rendering.
    if (!username) {
      continue;
    }

    accounts.push({
      username,
      profileUrl: href || `https://www.instagram.com/${username}`,
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
