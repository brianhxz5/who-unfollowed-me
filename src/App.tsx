import { useState } from "react";
import { readDroppedFiles } from "./adapters/readDroppedFiles";
import { computeViews } from "./core/computeViews";
import { parseExport } from "./core/parseExport";
import type { Account } from "./core/types";
import "./App.css";

function App() {
  const [notFollowingBack, setNotFollowingBack] = useState<Account[] | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files);
    const dropped = await readDroppedFiles(files);
    if (!dropped) return;

    const parsed = parseExport(dropped);
    const views = computeViews(parsed);
    setNotFollowingBack(views.notFollowingBack);
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

      {notFollowingBack && (
        <ul className="account-list">
          {notFollowingBack.map((account) => (
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
      )}
    </main>
  );
}

export default App;
