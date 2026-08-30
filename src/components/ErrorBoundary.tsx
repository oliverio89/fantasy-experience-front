import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled application error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-black text-nude flex flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="text-3xl font-titulo-2 font-bold">
            Algo no ha funcionado
          </h1>
          <p className="font-titulo-2">
            Recarga la página. Si el problema continúa, contacta con soporte.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-dark-gold px-8 py-3 text-black font-bold"
          >
            Recargar
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
