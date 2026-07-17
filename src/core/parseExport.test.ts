import { describe, expect, it } from "vitest";
import { parseExport } from "./parseExport";

describe("parseExport", () => {
  it("normalizes following.json records into Account objects", () => {
    const followingJson = {
      relationships_following: [
        {
          title: "",
          media_list_data: [],
          string_list_data: [
            {
              href: "https://www.instagram.com/alice",
              value: "alice",
              timestamp: 1614556800,
            },
          ],
        },
      ],
    };

    const result = parseExport({ followingJson, followersJson: [] });

    expect(result.following).toEqual([
      {
        username: "alice",
        profileUrl: "https://www.instagram.com/alice",
        timestamp: 1614556800,
      },
    ]);
  });

  it("normalizes followers_1.json records (bare array, no wrapper key)", () => {
    const followersJson = [
      {
        title: "",
        media_list_data: [],
        string_list_data: [
          {
            href: "https://www.instagram.com/bob",
            value: "bob",
            timestamp: 1620000000,
          },
        ],
      },
    ];

    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJson,
    });

    expect(result.followers).toEqual([
      {
        username: "bob",
        profileUrl: "https://www.instagram.com/bob",
        timestamp: 1620000000,
      },
    ]);
  });

  it("returns empty lists when both exports are empty", () => {
    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJson: [],
    });

    expect(result).toEqual({ following: [], followers: [] });
  });
});
