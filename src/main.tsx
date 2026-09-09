import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Neuroverse from "./Neuroverse";
import { readRoute } from "./route";

/* Presentation mode pulls in the Supabase client, so it is split out: someone
   reading Neuroverse alone should not download the live-room machinery. */
const Present = lazy(() => import("./Present"));
const Viewer = lazy(() => import("./Viewer"));

const route = readRoute();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {route.kind === "present" ? <Present />
        : route.kind === "viewer" ? <Viewer code={route.code} />
          : <Neuroverse />}
    </Suspense>
  </StrictMode>
);
