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

    const result = parseExport({
      followingJson,
      followersJsonFiles: [],
      pendingJson: [],
    });

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
      followersJsonFiles: [followersJson],
      pendingJson: [],
    });

    expect(result.followers).toEqual([
      {
        username: "bob",
        profileUrl: "https://www.instagram.com/bob",
        timestamp: 1620000000,
      },
    ]);
  });

  it("normalizes followers_1.json records wrapped in relationships_followers (real Instagram export shape)", () => {
    const followersJson = {
      relationships_followers: [
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
      ],
    };

    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [followersJson],
      pendingJson: [],
    });

    expect(result.followers).toEqual([
      {
        username: "bob",
        profileUrl: "https://www.instagram.com/bob",
        timestamp: 1620000000,
      },
    ]);
  });

  it("normalizes pending_follow_requests.json wrapped in relationships_follow_requests_sent (real Instagram export shape)", () => {
    const pendingJson = {
      relationships_follow_requests_sent: [
        {
          title: "",
          media_list_data: [],
          string_list_data: [
            {
              href: "https://www.instagram.com/erin",
              value: "erin",
              timestamp: 1640000000,
            },
          ],
        },
      ],
    };

    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [],
      pendingJson,
    });

    expect(result.pending).toEqual([
      {
        username: "erin",
        profileUrl: "https://www.instagram.com/erin",
        timestamp: 1640000000,
      },
    ]);
  });

  it("skips records with an empty string_list_data instead of crashing", () => {
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
        { title: "", media_list_data: [], string_list_data: [] },
      ],
    };

    const result = parseExport({
      followingJson,
      followersJsonFiles: [],
      pendingJson: [],
    });

    expect(result.following).toEqual([
      {
        username: "alice",
        profileUrl: "https://www.instagram.com/alice",
        timestamp: 1614556800,
      },
    ]);
  });

  it("derives username from href when the entry has no value field (real following.json shape)", () => {
    const followingJson = {
      relationships_following: [
        {
          title: "",
          string_list_data: [
            { href: "https://www.instagram.com/alice", timestamp: 1614556800 },
          ],
        },
      ],
    };

    const result = parseExport({
      followingJson,
      followersJsonFiles: [],
      pendingJson: [],
    });

    expect(result.following).toEqual([
      {
        username: "alice",
        profileUrl: "https://www.instagram.com/alice",
        timestamp: 1614556800,
      },
    ]);
  });

  it("derives username from an href with a trailing slash or query string", () => {
    const followingJson = {
      relationships_following: [
        {
          string_list_data: [
            { href: "https://www.instagram.com/carol/", timestamp: 1 },
          ],
        },
        {
          string_list_data: [
            { href: "https://instagram.com/dave?hl=en", timestamp: 2 },
          ],
        },
      ],
    };

    const result = parseExport({
      followingJson,
      followersJsonFiles: [],
      pendingJson: [],
    });

    expect(result.following.map((a) => a.username)).toEqual(["carol", "dave"]);
  });

  it("skips records that have neither a value nor a usable href", () => {
    const followingJson = {
      relationships_following: [
        { string_list_data: [{ timestamp: 1614556800 }] },
        {
          string_list_data: [
            {
              href: "https://www.instagram.com/bob",
              value: "bob",
              timestamp: 1614556800,
            },
          ],
        },
      ],
    };

    const result = parseExport({
      followingJson,
      followersJsonFiles: [],
      pendingJson: [],
    });

    expect(result.following).toEqual([
      {
        username: "bob",
        profileUrl: "https://www.instagram.com/bob",
        timestamp: 1614556800,
      },
    ]);
  });

  it("returns empty lists when both exports are empty", () => {
    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [],
      pendingJson: [],
    });

    expect(result).toEqual({ following: [], followers: [], pending: [] });
  });

  it("merges multiple followers_N.json files into one follower list", () => {
    const followers1 = [
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
    const followers2 = [
      {
        title: "",
        media_list_data: [],
        string_list_data: [
          {
            href: "https://www.instagram.com/dana",
            value: "dana",
            timestamp: 1630000000,
          },
        ],
      },
    ];

    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [followers1, followers2],
      pendingJson: [],
    });

    expect(result.followers).toEqual([
      {
        username: "bob",
        profileUrl: "https://www.instagram.com/bob",
        timestamp: 1620000000,
      },
      {
        username: "dana",
        profileUrl: "https://www.instagram.com/dana",
        timestamp: 1630000000,
      },
    ]);
  });

  it("normalizes pending_follow_requests.json records (bare array)", () => {
    const pendingJson = [
      {
        title: "",
        media_list_data: [],
        string_list_data: [
          {
            href: "https://www.instagram.com/erin",
            value: "erin",
            timestamp: 1640000000,
          },
        ],
      },
    ];

    const result = parseExport({
      followingJson: { relationships_following: [] },
      followersJsonFiles: [],
      pendingJson,
    });

    expect(result.pending).toEqual([
      {
        username: "erin",
        profileUrl: "https://www.instagram.com/erin",
        timestamp: 1640000000,
      },
    ]);
  });
});
