import { useEffect, useMemo, useState } from "react";
import { routes } from "./routes";
import { Sidebar } from "./components/Sidebar";

function getSlugFromHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash || "introduction";
}

export function App() {
  const [slug, setSlug] = useState<string>(getSlugFromHash);

  useEffect(() => {
    const handler = () => setSlug(getSlugFromHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  const route = useMemo(
    () => routes.find((r) => r.slug === slug) ?? routes[0]!,
    [slug],
  );

  const PageComponent = route.component;

  return (
    <div className="docs-shell">
      <Sidebar activeSlug={route.slug} />
      <main className="docs-main">
        <div className="docs-content">
          <PageComponent />
        </div>
      </main>
    </div>
  );
}
