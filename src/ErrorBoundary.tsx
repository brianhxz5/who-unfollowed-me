import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Last line of defense: a render error anywhere below this boundary shows a
 * recovery message instead of a blank white screen. The app's happy path
 * should never reach here — this exists so an unexpected export shape can
 * never leave the user staring at nothing.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app">
          <header className="app-header">
            <h1>Who doesn't follow me back</h1>
          </header>
          <div className="error-message" role="alert">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <p>
              Something went wrong reading that export. It may not be a
              recognized Instagram data export.{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => window.location.reload()}
              >
                Reload and try again
              </button>
              .
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
