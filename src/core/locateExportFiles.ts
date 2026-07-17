export interface LocatedExportFiles {
  followingJson: unknown;
  followersJsonFiles: unknown[];
}

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

function followersFileNumber(path: string): number {
  const match = basename(path).match(/^followers_(\d+)\.json$/);
  return match ? Number(match[1]) : 0;
}

export function locateExportFiles(
  files: Record<string, string>,
): LocatedExportFiles | null {
  const entries = Object.entries(files);

  const followingEntry = entries.find(([path]) =>
    basename(path) === "following.json",
  );
  const followersEntries = entries
    .filter(([path]) => /^followers(_\d+)?\.json$/.test(basename(path)))
    .sort(([a], [b]) => followersFileNumber(a) - followersFileNumber(b));

  if (!followingEntry) {
    return null;
  }

  return {
    followingJson: JSON.parse(followingEntry[1]),
    followersJsonFiles: followersEntries.map(([, text]) => JSON.parse(text)),
  };
}
