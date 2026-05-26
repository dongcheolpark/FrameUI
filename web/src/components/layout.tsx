import React, { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { routes } from "@/pages/docs/routes";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof routes>();
    for (const r of routes) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-sm bg-foreground text-background flex items-center justify-center font-bold text-xs">F</div>
              <span className="hidden font-bold sm:inline-block">FrameUI</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/components/introduction" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Components
              </Link>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none" />
            <nav className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex-1 flex container max-w-screen-2xl px-4 md:px-8 mx-auto">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block md:w-64 border-r border-border/40 py-6 pr-6">
          <div className="w-full h-full overflow-y-auto pr-4">
            {grouped.map(([category, items]) => (
              <div key={category} className="pb-4">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">{category}</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {items.map((item) => {
                    const href = `/components/${item.slug}`;
                    const isActive = location === href;
                    return (
                      <Link
                        key={item.slug}
                        href={href}
                        className={`flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 py-6 pl-0 md:pl-8">
          {children}
        </main>
      </div>
    </div>
  );
}
