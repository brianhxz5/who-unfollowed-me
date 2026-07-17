import { describe, expect, it } from "vitest";
import { locateExportFiles } from "./locateExportFiles";

describe("locateExportFiles", () => {
  it("locates following.json and a single followers file by basename", () => {
    const files: Record<string, string> = {
      "following.json": JSON.stringify({ relationships_following: [] }),
      "followers_1.json": JSON.stringify([{ marker: "followers_1" }]),
    };

    const result = locateExportFiles(files);

    expect(result).toEqual({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [[{ marker: "followers_1" }]],
      pendingJson: [],
    });
  });

  it("finds and sorts multi-part followers files by number, regardless of key order", () => {
    const files: Record<string, string> = {
      "followers_2.json": JSON.stringify([{ marker: "followers_2" }]),
      "following.json": JSON.stringify({ relationships_following: [] }),
      "followers_1.json": JSON.stringify([{ marker: "followers_1" }]),
    };

    const result = locateExportFiles(files);

    expect(result?.followersJsonFiles).toEqual([
      [{ marker: "followers_1" }],
      [{ marker: "followers_2" }],
    ]);
  });

  it("locates files by basename within a nested ZIP directory structure", () => {
    const files: Record<string, string> = {
      "connections/followers_and_following/following.json": JSON.stringify({
        relationships_following: [],
      }),
      "connections/followers_and_following/followers_1.json": JSON.stringify([
        { marker: "followers_1" },
      ]),
      "connections/followers_and_following/followers_2.json": JSON.stringify([
        { marker: "followers_2" },
      ]),
      "personal_information/profile.json": JSON.stringify({ irrelevant: true }),
    };

    const result = locateExportFiles(files);

    expect(result).toEqual({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [
        [{ marker: "followers_1" }],
        [{ marker: "followers_2" }],
      ],
      pendingJson: [],
    });
  });

  it("locates pending_follow_requests.json when present", () => {
    const files: Record<string, string> = {
      "following.json": JSON.stringify({ relationships_following: [] }),
      "followers_1.json": JSON.stringify([]),
      "pending_follow_requests.json": JSON.stringify([
        { marker: "pending" },
      ]),
    };

    const result = locateExportFiles(files);

    expect(result?.pendingJson).toEqual([{ marker: "pending" }]);
  });

  it("returns null when no following.json is present (not a recognizable export)", () => {
    const files: Record<string, string> = {
      "random.json": JSON.stringify({ nothing: true }),
    };

    expect(locateExportFiles(files)).toBeNull();
  });
});
