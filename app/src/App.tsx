import { useMemo, useState } from "react";
import { Button, Toast } from "FrameUI";
import { ExampleOnboarding } from "./pages/ExampleOnboarding";
import { ExampleStorefront } from "./pages/ExampleStorefront";
import { ExampleDashboard } from "./pages/ExampleDashboard";
import { ExampleBooking } from "./pages/ExampleBooking";

type DemoPage = {
  id: string;
  label: string;
  description: string;
  Component: () => JSX.Element;
};

const DEMO_PAGES: DemoPage[] = [
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Unstyled onboarding form with uploads and preferences.",
    Component: ExampleOnboarding,
  },
  {
    id: "storefront",
    label: "Storefront",
    description: "Product detail layout with tabs, carousel, and pagination.",
    Component: ExampleStorefront,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Settings and status page with switches and sliders.",
    Component: ExampleDashboard,
  },
  {
    id: "booking",
    label: "Booking",
    description: "Reservation flow with date picker and confirmation.",
    Component: ExampleBooking,
  },
];

export function App() {
  const [activeId, setActiveId] = useState(DEMO_PAGES[0]?.id ?? "onboarding");
  const activePage = useMemo(
    () => DEMO_PAGES.find((page) => page.id === activeId) ?? DEMO_PAGES[0],
    [activeId],
  );

  const ActiveComponent = activePage.Component;

  return (
    <Toast.Provider duration={4000} limit={3}>
      <div className="demo-app">
        <header className="demo-header">
          <div className="demo-title">
            <h1>FrameUI Demo</h1>
            <p className="demo-muted">
              Minimal layout only. Each page is built with FrameUI components.
            </p>
          </div>
          <nav className="demo-nav" aria-label="Example pages">
            {DEMO_PAGES.map((page) => (
              <Button
                key={page.id}
                label={page.label}
                aria-pressed={page.id === activeId}
                onClick={() => setActiveId(page.id)}
              />
            ))}
          </nav>
          <p className="demo-description">{activePage.description}</p>
        </header>

        <main className="demo-main">
          <ActiveComponent />
        </main>
      </div>
      <Toast.Viewport />
    </Toast.Provider>
  );
}