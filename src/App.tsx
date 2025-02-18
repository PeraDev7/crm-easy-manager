
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Leads from "./pages/Leads";
import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Index";
import QuotesSettings from "./pages/settings/QuotesSettings";
import CrmSettings from "./pages/settings/CrmSettings";
import UserSettings from "./pages/settings/UserSettings";
import Quotes from "./pages/Quotes";
import Auth from "./pages/Auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
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
    path: "/quotes",
    element: <Quotes />,
  },
  {
    path: "/settings",
    element: <CrmSettings />,
  },
  {
    path: "/settings/quotes",
    element: <QuotesSettings />,
  },
  {
    path: "/settings/user",
    element: <UserSettings />,
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
