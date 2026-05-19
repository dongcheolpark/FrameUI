import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Toast } from "FrameUI";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { routes } from "@/pages/docs/routes";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function DocsRouter() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Switch location={location}>
          <Route path="/" component={Home} />
          <Route path="/components">
            <Redirect to="/components/introduction" />
          </Route>
          {routes.map((r) => {
            const PageComponent = r.component;
            return (
              <Route key={r.slug} path={`/components/${r.slug}`}>
                <Layout>
                  <PageComponent />
                </Layout>
              </Route>
            );
          })}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="frameui-theme">
      <Toast.Provider duration={4000} limit={3}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <DocsRouter />
        </WouterRouter>
        <Toast.Viewport />
      </Toast.Provider>
    </ThemeProvider>
  );
}

export default App;
