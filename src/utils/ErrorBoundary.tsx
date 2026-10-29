import { Component, type ErrorInfo, type ReactNode } from "react";

interface BoundaryState {
  caught: Error | null;
}

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  BoundaryState
> {
  state: BoundaryState = { caught: null };

  static getDerivedStateFromError(caught: Error): BoundaryState {
    return { caught };
  }

  componentDidCatch(_error: Error, info: ErrorInfo): void {
    console.error("Admin console crashed:", info.componentStack);
  }

  render() {
    if (this.state.caught) {
      return (
        <div className="page" style={{ maxWidth: 720 }}>
          <div
            className="card card--padded warn-banner"
            style={{ display: "block" }}
          >
            <b>Console error</b> Something went unexpectedly wrong while
            rendering. Reload to get back in.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
