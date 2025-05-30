/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Login from "./pages/Login";
// import { APITester } from "./APITester";
import Layout from "./components/Layout";
import App from "./App";
import Signup from "./pages/Signup";

const routerConfig = createBrowserRouter([
  {
    path: "/app",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="login" /> },
      { path: "home", element: <App /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ],
    errorElement: <div>Error loading the app.</div>,
  },
]);

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(<RouterProvider router={routerConfig} />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
