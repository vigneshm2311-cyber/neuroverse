import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Neuroverse from "./Neuroverse";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Neuroverse />
  </StrictMode>
);
