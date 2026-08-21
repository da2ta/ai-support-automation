import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { statsService } from "../../services/stats";

export const AppShell: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme-mode");
    if (saved === "dark" || saved === "light") return saved;
    return "dark"; // Default to dark for this enterprise UI
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme-mode", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  // Health state
  const [healthStatus, setHealthStatus] = useState<"healthy" | "error" | "loading">("loading");
  const [version, setVersion] = useState("1.0.0");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const h = await statsService.checkHealth();
        setHealthStatus(h.status === "healthy" ? "healthy" : "error");
        if (h.version) setVersion(h.version);
      } catch (e) {
        setHealthStatus("error");
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground antialiased overflow-hidden">
      <Sidebar apiStatus={healthStatus} version={version} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-surface/30">
        <Topbar theme={theme} onToggleTheme={toggleTheme} />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
