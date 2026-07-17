import type { Account } from "./types";

export type SortBy = "username" | "date";

export function filterAndSort(
  accounts: Account[],
  options: { search: string; sortBy: SortBy },
): Account[] {
  const query = options.search.toLowerCase();
  const filtered = accounts.filter((a) =>
    a.username.toLowerCase().includes(query),
  );

  if (options.sortBy === "date") {
    return [...filtered].sort((a, b) => a.timestamp - b.timestamp);
  }

  return [...filtered].sort((a, b) =>
    a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
  );
}
