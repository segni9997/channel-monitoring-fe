import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "./components/layout/RootLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Login } from "./pages/Login";
import { SuperLogin } from "./pages/SuperLogin";
// import { Dashboard } from "./pages/Dashboard";
import { Incidents } from "./pages/Incidents";
import { AdminUserMgmt } from "./pages/AdminUserMgmt";
import { AdminReasonMgmt } from "./pages/AdminReasonMgmt";
import { Role } from "./types";
import { AdminLogin } from "./pages/AdminLogin";
import { Loader } from "./components/shared/Loader";
import ErrorPage from "./components/shared/ErrorPages";

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
      // {
      //   index: true,
      //   element: (
      //     <ProtectedRoute allowedRoles={[Role.super_admin, Role.admin, Role.pms_offcier, Role.epayment_officer]}>
      //       <Dashboard />
      //     </ProtectedRoute>
      //   ),
      // },
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
