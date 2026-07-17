import { strFromU8, unzip } from "fflate";

export function unzipExport(zipBytes: Uint8Array): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    unzip(zipBytes, (err, unzipped) => {
      if (err) {
        reject(err);
        return;
      }

      const files: Record<string, string> = {};
      for (const [path, data] of Object.entries(unzipped)) {
        if (path.endsWith(".json") || path.endsWith(".html")) {
          files[path] = strFromU8(data);
        }
      }
      resolve(files);
    });
  });
}
