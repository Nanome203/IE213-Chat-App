import { createRoot } from "react-dom/client";
import { HelloApp } from "./HelloApp";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<HelloApp />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
