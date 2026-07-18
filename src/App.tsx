import { useState } from "react";
import {
  addIgnored,
  getIgnored,
  removeIgnored,
} from "./adapters/ignoreListStorage";
import { readDroppedFiles } from "./adapters/readDroppedFiles";
import { applyIgnoreList } from "./core/applyIgnoreList";
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

const ERROR_MESSAGES: Record<
  "html-export" | "unrecognized" | "zip-error",
  string
> = {
  "html-export":
    "That looks like the HTML-format export. This app needs the JSON format — re-request your download and choose \"JSON\" instead of \"HTML\" as the file format.",
  unrecognized:
    "The ZIP opened, but it doesn't contain a following.json. If Instagram split your download into multiple ZIP files, drop all of them together, or drop the following.json and followers_*.json files directly.",
  "zip-error":
    "We couldn't open that ZIP file. It may be a partial or corrupted download — try downloading the export from Instagram again, then drop the .zip here.",
};

function App() {
  const [views, setViews] = useState<Views | null>(null);
  const [selectedView, setSelectedView] = useState<ViewKey>("notFollowingBack");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("username");
  const [ignored, setIgnored] = useState<Set<string>>(() => getIgnored());
  const [showIgnored, setShowIgnored] = useState(false);

  function toggleIgnored(username: string) {
    setIgnored(
      ignored.has(username) ? removeIgnored(username) : addIgnored(username),
    );
  }

  async function processFiles(files: File[]) {
    try {
      const result = await readDroppedFiles(files);

      if (result.kind !== "ok") {
        setError(ERROR_MESSAGES[result.kind]);
        setViews(null);
        return;
      }

      const parsed = parseExport(result);
      setError(null);
      setViews(computeViews(parsed));
      setSelectedView("notFollowingBack");
      setSearch("");
      setSortBy("username");
    } catch {
      setError(ERROR_MESSAGES.unrecognized);
      setViews(null);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(event.dataTransfer.files));
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      processFiles(Array.from(event.target.files));
    }
    event.target.value = "";
  }

  const visibleLists: Views | null = views && {
    ...views,
    notFollowingBack: applyIgnoreList(views.notFollowingBack, ignored),
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1>Who doesn't follow me back</h1>
        <p className="trust-line">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Everything runs in your browser. Nothing is uploaded.
        </p>
      </header>

      <label
        className={`dropzone${isDragging ? " dropzone--active" : ""}${views ? " dropzone--compact" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="dropzone__input"
          multiple
          accept=".zip,.json"
          onChange={handleFileSelect}
        />
        <span className="dropzone__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15V3" />
            <path d="m7 8 5-5 5 5" />
            <path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
          </svg>
        </span>
        <span className="dropzone__hint dropzone__hint--full">
          Drop your Instagram data export <code>.zip</code>, or the individual{" "}
          <code>following.json</code> and <code>followers_*.json</code> files,
          here
        </span>
        <span className="dropzone__hint dropzone__hint--compact">
          Drop a new export to refresh your dashboard
        </span>
      </label>

      {error && (
        <div className="error-message" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {!views && !error && (
        <div className="onboarding">
          <p className="onboarding__lead">
            New here? Get your export from Instagram first:
          </p>
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

      {views && visibleLists && (
        <>
          <div className="stat-cards">
            {VIEW_CARDS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`stat-card${selectedView === key ? " stat-card--selected" : ""}`}
                onClick={() => setSelectedView(key)}
              >
                <span className="stat-card__count">
                  {visibleLists[key].length}
                </span>
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
            <button
              type="button"
              className="ignored-toggle"
              onClick={() => setShowIgnored((v) => !v)}
            >
              ignored ({ignored.size})
            </button>
          </div>

          {showIgnored ? (
            ignored.size === 0 ? (
              <p className="list-empty">
                No ignored accounts yet. Ignore an account to hide it from your
                lists.
              </p>
            ) : (
              <ul className="account-list">
                {[...ignored].sort().map((username) => (
                  <li key={username}>
                    <a
                      href={`https://instagram.com/${username}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {username}
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleIgnored(username)}
                    >
                      Un-ignore
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            (() => {
              const rows = filterAndSort(visibleLists[selectedView], {
                search,
                sortBy,
              });
              if (rows.length === 0) {
                return (
                  <p className="list-empty">
                    {search
                      ? `No accounts match "${search}".`
                      : "No accounts in this view."}
                  </p>
                );
              }
              return (
                <ul className="account-list">
                  {rows.map((account) => (
                    <li key={account.username}>
                      <a
                        href={`https://instagram.com/${account.username}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {account.username}
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleIgnored(account.username)}
                      >
                        {ignored.has(account.username) ? "Un-ignore" : "Ignore"}
                      </button>
                    </li>
                  ))}
                </ul>
              );
            })()
          )}
        </>
      )}
    </main>
  );
}

export default App;
