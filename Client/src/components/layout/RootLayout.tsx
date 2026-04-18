import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

export const RootLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all possible theme classes
    root.classList.remove("light", "dark", "forest", "coffee");
    // Add the current theme
    root.classList.add(theme);
  }, [theme]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2  mx-auto opacity-5 pointer-events-none">
          <img src="/bg1.png" alt="" className="w-screen h-screen object-cover" />
        </div>
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
