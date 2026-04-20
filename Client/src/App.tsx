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

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
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
          <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PMS_OFFICER, Role.EPAYMENT_OFFICER]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "incidents",
        element: (
          <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.PMS_OFFICER, Role.EPAYMENT_OFFICER]}>
            <Incidents />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]}>
            <AdminUserMgmt />
          </ProtectedRoute>
        ),
      },
      {
        path: "reasons",
        element: (
          <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]}>
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
