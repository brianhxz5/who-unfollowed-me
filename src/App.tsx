import { useState } from "react";
import { readDroppedFiles } from "./adapters/readDroppedFiles";
import { computeViews } from "./core/computeViews";
import type { Views } from "./core/computeViews";
import { parseExport } from "./core/parseExport";
import "./App.css";

type ViewKey = keyof Views;

const VIEW_CARDS: { key: ViewKey; label: string }[] = [
  { key: "notFollowingBack", label: "Not following you back" },
  { key: "fans", label: "Fans" },
  { key: "mutuals", label: "Mutuals" },
  { key: "pending", label: "Pending requests" },
];

function App() {
  const [views, setViews] = useState<Views | null>(null);
  const [selectedView, setSelectedView] = useState<ViewKey>("notFollowingBack");
  const [isDragging, setIsDragging] = useState(false);

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const dropped = await readDroppedFiles(files);
    if (!dropped) return;

    const parsed = parseExport(dropped);
    setViews(computeViews(parsed));
    setSelectedView("notFollowingBack");
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

          <ul className="account-list">
            {views[selectedView].map((account) => (
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
