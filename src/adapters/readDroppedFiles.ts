export interface DroppedExportFiles {
  followingJson: unknown;
  followersJson: unknown;
}

function readFileAsJson(file: File): Promise<unknown> {
  return file.text().then((text) => JSON.parse(text));
}

export async function readDroppedFiles(
  files: File[],
): Promise<DroppedExportFiles | null> {
  const followingFile = files.find((f) => f.name.startsWith("following"));
  const followersFile = files.find((f) => f.name.startsWith("followers"));

  if (!followingFile || !followersFile) {
    return null;
  }

  const [followingJson, followersJson] = await Promise.all([
    readFileAsJson(followingFile),
    readFileAsJson(followersFile),
  ]);

  return { followingJson, followersJson };
}
