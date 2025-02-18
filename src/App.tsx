import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Quotes from "./pages/Quotes";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Leads from "./pages/Leads";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { AuthProvider } from "./components/AuthProvider";
import Login from "./pages/Login";
import { RequireAuth } from "./components/RequireAuth";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Quotes />
      </RequireAuth>
    ),
  },
  {
    path: "/quotes",
    element: (
      <RequireAuth>
        <Quotes />
      </RequireAuth>
    ),
  },
  {
    path: "/clients",
    element: (
      <RequireAuth>
        <Clients />
      </RequireAuth>
    ),
  },
  {
    path: "/projects",
    element: (
      <RequireAuth>
        <Projects />
      </RequireAuth>
    ),
  },
  {
    path: "/invoices",
    element: (
      <RequireAuth>
        <Invoices />
      </RequireAuth>
    ),
  },
  {
    path: "/leads",
    element: (
      <RequireAuth>
        <Leads />
      </RequireAuth>
    ),
  },
  {
    path: "/tasks",
    element: (
      <RequireAuth>
        <Tasks />
      </RequireAuth>
    ),
  },
  {
    path: "/calendar",
    element: (
      <RequireAuth>
        <Calendar />
      </RequireAuth>
    ),
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);

function App() {
  return (
    <QueryClientProvider value={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
