import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export const RootLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
             <img src="/bg.png" alt="Logo" className="h-8 object-contain" />
             <span className="font-bold text-sm text-accent">Channel Monitor</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className={cn(
          "flex-1 overflow-y-auto relative p-4 md:p-8",
          isSidebarOpen ? "pointer-events-none lg:pointer-events-auto" : ""
        )}>
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mx-auto opacity-5 pointer-events-none z-0">
            <img src="/bg1.png" alt="" className="w-screen h-screen object-cover" />
          </div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
