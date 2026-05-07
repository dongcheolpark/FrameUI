import { useMemo } from "react";
import { routes } from "../routes";

interface SidebarProps {
  activeSlug: string;
}

export function Sidebar({ activeSlug }: SidebarProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof routes>();
    for (const route of routes) {
      const list = map.get(route.category) ?? [];
      list.push(route);
      map.set(route.category, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <aside className="docs-sidebar">
      <a href="#/introduction" className="docs-brand">
        <span className="docs-brand-mark">F</span>
        <span className="docs-brand-name">FrameUI</span>
        <span className="docs-brand-version">v0.1</span>
      </a>
      <nav className="docs-nav">
        {grouped.map(([category, items]) => (
          <div key={category} className="docs-nav-group">
            <div className="docs-nav-heading">{category}</div>
            <ul>
              {items.map((item) => (
                <li key={item.slug}>
                  <a
                    href={`#/${item.slug}`}
                    className={item.slug === activeSlug ? "docs-nav-link is-active" : "docs-nav-link"}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
