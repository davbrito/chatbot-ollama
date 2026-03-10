import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundaryWrapper from "./components/ErrorBoundary";
import "./index.css";
import { bootstrapSessionAuth } from "./lib/sessionAuth.ts";

void bootstrapSessionAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>,
);
