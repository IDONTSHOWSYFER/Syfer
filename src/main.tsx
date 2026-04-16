import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Note: StrictMode double-renders the 3D scene which is wasteful in dev.
// We skip it so useFrame / physics behave predictably while iterating.
createRoot(document.getElementById("root")!).render(<App />);
