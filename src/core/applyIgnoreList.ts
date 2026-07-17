import type { Account } from "./types";

export function applyIgnoreList(
  accounts: Account[],
  ignored: Set<string>,
): Account[] {
  return accounts.filter((a) => !ignored.has(a.username));
}
