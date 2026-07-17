export type LocateExportFilesResult =
  | {
      kind: "ok";
      followingJson: unknown;
      followersJsonFiles: unknown[];
      pendingJson: unknown;
    }
  | { kind: "html-export" }
  | { kind: "unrecognized" };

function basename(path: string): string {
  return path.split("/").pop() ?? path;
}

function followersFileNumber(path: string): number {
  const match = basename(path).match(/^followers_(\d+)\.json$/);
  return match ? Number(match[1]) : 0;
}

export function locateExportFiles(
  files: Record<string, string>,
): LocateExportFilesResult {
  const entries = Object.entries(files);

  const followingJsonEntry = entries.find(
    ([path]) => basename(path) === "following.json",
  );
  const followingHtmlEntry = entries.find(
    ([path]) => basename(path) === "following.html",
  );

  if (!followingJsonEntry) {
    return followingHtmlEntry ? { kind: "html-export" } : { kind: "unrecognized" };
  }

  const followersEntries = entries
    .filter(([path]) => /^followers(_\d+)?\.json$/.test(basename(path)))
    .sort(([a], [b]) => followersFileNumber(a) - followersFileNumber(b));
  const pendingEntry = entries.find(
    ([path]) => basename(path) === "pending_follow_requests.json",
  );

  return {
    kind: "ok",
    followingJson: JSON.parse(followingJsonEntry[1]),
    followersJsonFiles: followersEntries.map(([, text]) => JSON.parse(text)),
    pendingJson: pendingEntry ? JSON.parse(pendingEntry[1]) : [],
  };
}
