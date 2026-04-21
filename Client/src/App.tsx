import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/Login";
import { SuperLogin } from "./pages/SuperLogin";
import { Dashboard } from "./pages/Dashboard";
import { Incidents } from "./pages/Incidents";
import { AdminUserMgmt } from "./pages/AdminUserMgmt";
import { AdminReasonMgmt } from "./pages/AdminReasonMgmt";
import { Role } from "./types";
import { AdminLogin } from "./pages/AdminLogin";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
    {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/super-login",
    element: <SuperLogin />,
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "incidents",
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer]}>
            <Incidents />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin]}>
            <AdminUserMgmt />
          </ProtectedRoute>
        ),
      },
      {
        path: "reasons",
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin]}>
            <AdminReasonMgmt />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
