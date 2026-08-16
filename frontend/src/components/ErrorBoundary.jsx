import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Yatri.in UI crashed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          <section className="max-w-md rounded-lg border border-white/10 bg-white/10 p-6 text-center shadow-xl">
            <h1 className="text-2xl font-bold">Yatri.in could not load</h1>
            <p className="mt-3 text-sm text-slate-200">Please refresh the page. The team has been notified in the console.</p>
            <button
              className="mt-5 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
