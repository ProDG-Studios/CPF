import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const checkWidth = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains('w-20'));
      }
    };

    const observer = new MutationObserver(checkWidth);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
