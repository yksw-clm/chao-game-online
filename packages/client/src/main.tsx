import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { TEST } from "@chao-game-online/shared";

createRoot(document.getElementById("root")!).render(<StrictMode>{TEST}</StrictMode>);
