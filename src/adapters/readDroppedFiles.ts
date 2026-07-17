import { locateExportFiles, type LocatedExportFiles } from "../core/locateExportFiles";
import { unzipExport } from "./unzipExport";

async function readLooseFiles(files: File[]): Promise<Record<string, string>> {
  const entries = await Promise.all(
    files.map(async (file) => [file.name, await file.text()] as const),
  );
  return Object.fromEntries(entries);
}

export async function readDroppedFiles(
  files: File[],
): Promise<LocatedExportFiles | null> {
  if (files.length === 0) {
    return null;
  }

  const isSingleZip = files.length === 1 && files[0].name.endsWith(".zip");

  const extractedFiles = isSingleZip
    ? await unzipExport(new Uint8Array(await files[0].arrayBuffer()))
    : await readLooseFiles(files);

  return locateExportFiles(extractedFiles);
}
