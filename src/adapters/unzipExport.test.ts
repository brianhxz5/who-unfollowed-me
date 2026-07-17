import { zipSync, strToU8 } from "fflate";
import { describe, expect, it } from "vitest";
import { unzipExport } from "./unzipExport";

describe("unzipExport", () => {
  it("extracts JSON file contents as text, keyed by their path in the archive", async () => {
    const zipBytes = zipSync({
      "connections/followers_and_following/following.json": strToU8(
        JSON.stringify({ relationships_following: [] }),
      ),
      "connections/followers_and_following/followers_1.json": strToU8(
        JSON.stringify([{ marker: "followers_1" }]),
      ),
    });

    const result = await unzipExport(zipBytes);

    expect(
      JSON.parse(
        result["connections/followers_and_following/following.json"],
      ),
    ).toEqual({ relationships_following: [] });
    expect(
      JSON.parse(
        result["connections/followers_and_following/followers_1.json"],
      ),
    ).toEqual([{ marker: "followers_1" }]);
  });
});
