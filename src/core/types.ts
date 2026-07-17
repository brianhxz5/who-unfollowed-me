export interface Account {
  username: string;
  profileUrl: string;
  timestamp: number;
}

export interface ParsedExport {
  following: Account[];
  followers: Account[];
}
