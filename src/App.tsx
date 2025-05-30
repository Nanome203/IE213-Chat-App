import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Signup from "./pages/Signup";
import { useEffect, useState } from "react";
import { authContext } from "./context";
import axios from "axios";

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const routerConfig = createBrowserRouter([
    {
      path: "/app",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Navigate to={`/app/${isLoggedIn ? "home" : "login"}`} />,
        },
        {
          path: "home",
          element: isLoggedIn ? (
            <div className="text-center text-9xl text-red-600">
              WHAT'S UP HOMIE IT'S TONY!!!!!!
            </div>
          ) : (
            <Navigate to="/app/login" />
          ),
        },
        {
          path: "login",
          element: isLoggedIn ? <Navigate to="/app/home" /> : <Login />,
        },
        {
          path: "signup",
          element: isLoggedIn ? <Navigate to="/app/home" /> : <Signup />,
        },
      ],
      errorElement: <div>Error loading the app.</div>,
    },
  ]);

  useEffect(() => {
    async function checkAuth() {
      const response = await axios.get("http://localhost:3000/auth/check-auth");
      const authStatus = response.data.status;

      if (authStatus === 200) {
        setIsLoggedIn(true);
      }
    }
    checkAuth();
  }, []);

  return (
    <authContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <RouterProvider router={routerConfig} />
    </authContext.Provider>
  );
}

export default App;
