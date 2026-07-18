import { locateExportFiles, type LocateExportFilesResult } from "../core/locateExportFiles";
import { unzipExport } from "./unzipExport";

export type ReadDroppedFilesResult =
  | LocateExportFilesResult
  | { kind: "zip-error" };

async function readLooseFiles(files: File[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    files.map(async (file) => [file.name, await file.text()] as const),
  );
  return Object.fromEntries(entries);
}

function isZip(file: File): boolean {
  return file.name.toLowerCase().endsWith(".zip");
}

export async function readDroppedFiles(
  files: File[],
): Promise<ReadDroppedFilesResult> {
  if (files.length === 0) {
    return { kind: "unrecognized" };
  }

  // If every dropped item is a ZIP, unzip them all and merge — Instagram
  // splits large "All time" downloads into multiple ZIP parts, and the
  // relevant files can live in any part.
  const allZips = files.every(isZip);

  let extractedFiles: Record<string, string>;
  if (allZips) {
    extractedFiles = {};
    for (const file of files) {
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        Object.assign(extractedFiles, await unzipExport(bytes));
      } catch (error) {
        console.error("[who-unfollowed-me] Failed to unzip", file.name, error);
        return { kind: "zip-error" };
      }
    }
  } else {
    extractedFiles = await readLooseFiles(files);
  }

  // Log only the file paths (no contents) so the structure can be inspected
  // when an export doesn't parse. Nothing here leaves the browser.
  console.log(
    "[who-unfollowed-me] Files located in drop:",
    Object.keys(extractedFiles),
  );

  return locateExportFiles(extractedFiles);
}
