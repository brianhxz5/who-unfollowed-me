const STORAGE_KEY = "who-unfollowed-me:ignored";

export function getIgnored(): Set<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return new Set();
  return new Set(JSON.parse(raw) as string[]);
}

function save(ignored: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ignored]));
}

export function addIgnored(username: string): Set<string> {
  const ignored = getIgnored();
  ignored.add(username);
  save(ignored);
  return ignored;
}

export function removeIgnored(username: string): Set<string> {
  const ignored = getIgnored();
  ignored.delete(username);
  save(ignored);
  return ignored;
}
