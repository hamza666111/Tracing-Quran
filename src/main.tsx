
  import { createRoot } from "react-dom/client";
  import { createBrowserRouter, RouterProvider } from "react-router-dom";
  import App from "./app/App.tsx";
  import { AdminLoginPage } from "./app/admin-login/AdminLoginPage";
  import { AdminDashboard } from "./app/admin-dashboard/AdminDashboard";
  import { AdminRoute } from "./app/components/AdminRoute";
  import "./styles/index.css";

  const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/admin-login", element: <AdminLoginPage /> },
    {
      path: "/admin-dashboard",
      element: (
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      ),
    },
  ]);

  createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
  