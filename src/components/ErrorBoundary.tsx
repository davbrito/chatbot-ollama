import React from "react";
import { ErrorBoundary as REB, type FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      role="alert"
      className="m-6 rounded border border-red-200 bg-red-50 p-6 text-center"
    >
      <p className="text-lg font-semibold text-red-700">Algo salió mal</p>
      <pre className="mt-2 max-h-40 overflow-auto text-sm whitespace-pre-wrap text-red-600">
        {(error as any)?.message}
      </pre>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={resetErrorBoundary}
          className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Reintentar
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Recargar
        </button>
      </div>
    </div>
  );
}

export default function ErrorBoundaryWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <REB
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log to console for now — replace with telemetry if desired
         
        console.error("Uncaught error:", error, info);
      }}
    >
      {children}
    </REB>
  );
}
