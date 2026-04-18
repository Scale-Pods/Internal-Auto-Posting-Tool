"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  
  // To avoid hydration mismatch, optionally verify mounted state, but keeping it simple:
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />; // Placeholder

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="p-2 inline-flex items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Sun className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      )}
    </button>
  );
}
