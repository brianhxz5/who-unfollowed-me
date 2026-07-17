import { useState } from "react";
import { readDroppedFiles } from "./adapters/readDroppedFiles";
import { computeViews } from "./core/computeViews";
import type { Views } from "./core/computeViews";
import { filterAndSort, type SortBy } from "./core/filterAndSort";
import { parseExport } from "./core/parseExport";
import "./App.css";

type ViewKey = keyof Views;

const VIEW_CARDS: { key: ViewKey; label: string }[] = [
  { key: "notFollowingBack", label: "Not following you back" },
  { key: "fans", label: "Fans" },
  { key: "mutuals", label: "Mutuals" },
  { key: "pending", label: "Pending requests" },
];

const DOWNLOAD_INFO_URL =
  "https://accountscenter.instagram.com/info_and_permissions/dyi/";

const ERROR_MESSAGES: Record<"html-export" | "unrecognized", string> = {
  "html-export":
    "That looks like the HTML-format export. This app needs the JSON format — re-request your download and choose \"JSON\" instead of \"HTML\" as the file format.",
  unrecognized:
    "That doesn't look like an Instagram data export. Drop the export ZIP, or the following.json and followers_*.json files from inside it.",
};

function App() {
  const [views, setViews] = useState<Views | null>(null);
  const [selectedView, setSelectedView] = useState<ViewKey>("notFollowingBack");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("username");

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const result = await readDroppedFiles(files);

    if (result.kind !== "ok") {
      setError(ERROR_MESSAGES[result.kind]);
      setViews(null);
      return;
    }

    setError(null);
    const parsed = parseExport(result);
    setViews(computeViews(parsed));
    setSelectedView("notFollowingBack");
    setSearch("");
    setSortBy("username");
  }

  return (
    <main className="app">
      <h1>Who doesn't follow me back</h1>

      <div
        className={`dropzone${isDragging ? " dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        Drop your Instagram data export <code>.zip</code>, or the individual{" "}
        <code>following.json</code> and <code>followers_*.json</code> files,
        here
      </div>

      {error && <p className="error-message">{error}</p>}

      {!views && !error && (
        <div className="onboarding">
          <p>New here? Get your export from Instagram first:</p>
          <ol>
            <li>
              Go to{" "}
              <a href={DOWNLOAD_INFO_URL} target="_blank" rel="noreferrer">
                Download your information
              </a>{" "}
              in Instagram's settings.
            </li>
            <li>
              Request a download of <strong>Followers and following</strong>{" "}
              in <strong>JSON</strong> format (not HTML).
            </li>
            <li>
              Once Instagram emails you the export, drop the ZIP (or the
              extracted files) above.
            </li>
          </ol>
        </div>
      )}

      {views && (
        <>
          <div className="stat-cards">
            {VIEW_CARDS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`stat-card${selectedView === key ? " stat-card--selected" : ""}`}
                onClick={() => setSelectedView(key)}
              >
                <span className="stat-card__count">{views[key].length}</span>
                <span className="stat-card__label">{label}</span>
              </button>
            ))}
          </div>

          <div className="list-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Search by username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="username">Sort: username (A–Z)</option>
              <option value="date">Sort: relationship date</option>
            </select>
          </div>

          <ul className="account-list">
            {filterAndSort(views[selectedView], { search, sortBy }).map((account) => (
              <li key={account.username}>
                <a
                  href={`https://instagram.com/${account.username}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {account.username}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default App;
