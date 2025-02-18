
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Leads from "./pages/Leads";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Index";
import SettingsLayout from "./pages/settings/Layout";
import QuotesSettings from "./pages/settings/QuotesSettings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/clients",
    element: <Clients />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/leads",
    element: <Leads />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/settings",
    element: <SettingsLayout />,
    children: [
      {
        path: "quotes",
        element: <QuotesSettings />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
