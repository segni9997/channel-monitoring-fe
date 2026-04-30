import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Incidents } from "./pages/Incidents";
import { AdminUserMgmt } from "./pages/AdminUserMgmt";
import { AdminReasonMgmt } from "./pages/AdminReasonMgmt";
import { AdminBranchMgmt } from "./pages/AdminBranchMgmt";
import { Role } from "./types";
import { AdminLogin } from "./pages/AdminLogin";
import { SuperLogin } from "./pages/SuperLogin";
import { ChangePassword } from "./pages/ChangePassword";
import { Loader } from "./components/shared/Loader";
import ErrorPage from "./components/shared/ErrorPages";
import { UserLogin } from "./pages/UserLogin";

const router = createBrowserRouter([
  // {
  //   path: "/login",
  //   element: <AdminLogin />,
  // },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/super-admin/login",
    element: <SuperLogin />,
  },
  {
    path: "/login",
    element: <UserLogin />,
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
        errorElement:<Loader/>,
      },
      {
        path: "reasons",
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin]}>
            <AdminReasonMgmt />
          </ProtectedRoute>
        ),
      },
      {
        path: "network",
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin]}>
            <AdminBranchMgmt />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/change-password",
        element: (
          <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer]}>
            <ChangePassword />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <ErrorPage code={404} title="Page Not Found" message="The page you are looking for does not exist." />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
