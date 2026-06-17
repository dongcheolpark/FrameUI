import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Layers,
  Palette,
  Code2,
  Sun,
  Moon,
  Check,
  ChevronDown,
  X,
  Square,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { CubeLogo, InlineLogo } from "@/components/logo";
import { Modal, Button as FrameButton } from "FrameUI";

/* ─────────────────────────────────────────────────────────── */
/* Constants                                                   */
/* ─────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Palette,
    title: "Zero styles, your design",
    description:
      "FrameUI ships no CSS. Every component accepts className and forwards native HTML props — drop into Tailwind, CSS Modules, or vanilla CSS without conflicts.",
  },
  {
    icon: Shield,
    title: "ARIA & keyboard built-in",
    description:
      "Components apply correct ARIA roles and attributes. Tabs, Accordion, Carousel, RadioCards, and FileDropzone support arrow-key navigation out of the box.",
  },
  {
    icon: Layers,
    title: "Compound subcomponents",
    description:
      "Multi-part components expose subcomponents like Tabs.List, Tabs.Trigger, Tabs.Content — you control structure and styling at every level.",
  },
  {
    icon: Code2,
    title: "Controlled or uncontrolled",
    description:
      "Pass value + onChange for controlled state, or defaultValue for uncontrolled — same API across Switch, Slider, Modal, Tabs, and Accordion.",
  },
];

const COMPONENTS_PREVIEW = [
  { slug: "button", label: "Button", desc: "Native button with label prop" },
  { slug: "switch", label: "Switch", desc: "role=switch toggle" },
  {
    slug: "slider",
    label: "Slider",
    desc: "Range input with keyboard support",
  },
  { slug: "textarea", label: "Textarea", desc: "Auto-sizing multi-line input" },
  {
    slug: "checkbox-cards",
    label: "CheckboxCards",
    desc: "Card-style checkbox group",
  },
  { slug: "radio-cards", label: "RadioCards", desc: "Card-style radio group" },
  {
    slug: "file-dropzone",
    label: "FileDropzone",
    desc: "Drop or click to upload files",
  },
  { slug: "tabs", label: "Tabs", desc: "ARIA Tabs pattern" },
  {
    slug: "pagination",
    label: "Pagination",
    desc: "Page navigation with siblings",
  },
  {
    slug: "accordion",
    label: "Accordion",
    desc: "Expandable disclosure sections",
  },
  { slug: "carousel", label: "Carousel", desc: "Slide carousel with autoplay" },
  { slug: "modal", label: "Modal", desc: "Focus-trapped dialog overlay" },
  { slug: "popup", label: "Popup", desc: "Status notification popup" },
  { slug: "toast", label: "Toast", desc: "Stacked toast notifications" },
];

const TICKER_ITEMS = [
  "Button",
  "Switch",
  "Slider",
  "Textarea",
  "CheckboxCards",
  "RadioCards",
  "Tabs",
  "Pagination",
  "Accordion",
  "Carousel",
  "FileDropzone",
  "Modal",
  "Popup",
  "Toast",
  "WAI-ARIA",
  "TypeScript",
  "Headless",
  "Compound API",
  "Keyboard Nav",
  "Zero CSS",
];

/* ─────────────────────────────────────────────────────────── */
/* Sub-components                                              */
/* ─────────────────────────────────────────────────────────── */

function Header() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-sm"
          >
            <InlineLogo size={26} />
            FrameUI
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/components/introduction"
              className="hover:text-foreground transition-colors"
            >
              Components
            </Link>
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#quick-start"
              className="hover:text-foreground transition-colors"
            >
              Quick start
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            data-testid="link-header-github"
            className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent transition-colors"
          >
            <SiGithub className="h-4 w-4" />
          </a>
          <button
            data-testid="button-toggle-theme"
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent transition-colors"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* Mini UI mock cards floating in the 3D scene */
function MiniModal() {
  return (
    <div className="w-44 rounded-xl border bg-background shadow-xl p-3 text-left">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold">Confirm action</span>
        <X className="h-3 w-3 text-muted-foreground" />
      </div>
      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
        This action cannot be undone. Are you sure?
      </p>
      <div className="flex gap-1.5">
        <div className="h-5 flex-1 rounded bg-muted text-[9px] flex items-center justify-center text-muted-foreground font-medium">
          Cancel
        </div>
        <div className="h-5 flex-1 rounded bg-foreground text-[9px] flex items-center justify-center text-background font-medium">
          Delete
        </div>
      </div>
    </div>
  );
}

function MiniDropdown() {
  return (
    <div className="w-36 rounded-xl border bg-background shadow-xl overflow-hidden text-left">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-[10px] font-medium">Options</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>
      {["Edit", "Duplicate", "Archive", "Delete"].map((item, i) => (
        <div
          key={item}
          className={`px-3 py-1.5 text-[10px] ${i === 0 ? "bg-accent/60 text-accent-foreground" : "text-muted-foreground"}`}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function MiniTabs() {
  return (
    <div className="w-44 rounded-xl border bg-background shadow-xl overflow-hidden text-left">
      <div className="flex border-b">
        {["Preview", "Code", "Docs"].map((tab, i) => (
          <div
            key={tab}
            className={`px-3 py-2 text-[10px] font-medium border-b-2 -mb-px ${i === 0 ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="h-1.5 w-3/4 rounded bg-muted mb-1.5" />
        <div className="h-1.5 w-1/2 rounded bg-muted mb-1.5" />
        <div className="h-1.5 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

function MiniSwitch() {
  const [on, setOn] = useState(true);
  return (
    <div className="w-36 rounded-xl border bg-background shadow-xl p-3 text-left">
      <p className="text-[10px] font-semibold mb-2.5">Settings</p>
      {[
        ["Notifications", true],
        ["Dark mode", on],
        ["Analytics", false],
      ].map(([label, val], i) => (
        <div
          key={i}
          className="flex items-center justify-between mb-1.5 last:mb-0"
        >
          <span className="text-[9px] text-muted-foreground">
            {label as string}
          </span>
          <button
            type="button"
            onClick={i === 1 ? () => setOn(!on) : undefined}
            className={`relative h-3.5 w-6 rounded-full transition-colors ${val ? "bg-foreground" : "bg-muted"}`}
          >
            <span
              className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-background shadow transition-transform ${val ? "translate-x-3" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

/* The 3D hero scene with mouse-driven tilt */
function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useTransform(mouseY, [-1, 1], [8, -8]), {
    stiffness: 120,
    damping: 20,
  });
  const rotY = useSpring(useTransform(mouseX, [-1, 1], [-10, 10]), {
    stiffness: 120,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: 440, height: 440, perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(99,102,241,0.18) 0%, transparent 70%)",
          animation: "glow-pulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 200,
          height: 200,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          animation: "glow-pulse 6s ease-in-out infinite 2s",
        }}
      />

      {/* Scene wrapper — responds to mouse */}
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Center: 3D spinning logo cube */}
        <motion.div
          className="absolute"
          style={{ zIndex: 10 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <CubeLogo size={96} heroSpin />
        </motion.div>

        {/* Floating card: Modal — top-left */}
        <motion.div
          className="absolute"
          style={{ top: 30, left: 20 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div style={{ animation: "float-a 4.2s ease-in-out infinite" }}>
            <MiniModal />
          </div>
        </motion.div>

        {/* Floating card: Dropdown — top-right */}
        <motion.div
          className="absolute"
          style={{ top: 50, right: 10 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <div style={{ animation: "float-b 3.8s ease-in-out infinite" }}>
            <MiniDropdown />
          </div>
        </motion.div>

        {/* Floating card: Tabs — bottom-left */}
        <motion.div
          className="absolute"
          style={{ bottom: 40, left: 16 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div style={{ animation: "float-c 5s ease-in-out infinite" }}>
            <MiniTabs />
          </div>
        </motion.div>

        {/* Floating card: Switch — bottom-right */}
        <motion.div
          className="absolute"
          style={{ bottom: 55, right: 14 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
        >
          <div style={{ animation: "float-a 4.8s ease-in-out infinite 1s" }}>
            <MiniSwitch />
          </div>
        </motion.div>

        {/* Orbit dots */}
        <div
          className="absolute"
          style={{
            width: 88,
            height: 88,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.8)",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -4,
              marginLeft: -4,
              animation: "orbit-dot 3.5s linear infinite",
              boxShadow: "0 0 6px rgba(99,102,241,0.6)",
            }}
          />
        </div>
        <div
          className="absolute"
          style={{
            width: 120,
            height: 120,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "rgba(139,92,246,0.7)",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -3,
              marginLeft: -3,
              animation: "orbit-dot-rev 5s linear infinite",
              boxShadow: "0 0 6px rgba(139,92,246,0.5)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function HeroSection() {
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
  };
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-background">
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-6">
          {/* Left: Text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div
              variants={fadeUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              v1.0 — Now available
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-5 text-5xl md:text-6xl font-bold tracking-tight leading-[1.08]"
            >
              Headless UI
              <br />
              <span className="text-muted-foreground font-normal">
                primitives.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-8 text-lg text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              FrameUI gives you accessibility, keyboard navigation, and ARIA.
              You own every pixel of the design.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
            >
              <Link
                href="/components/introduction"
                data-testid="link-hero-browse"
                className="group inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse components
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#quick-start"
                data-testid="link-hero-quickstart"
                className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Quick start
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center lg:justify-start gap-5 text-sm text-muted-foreground"
            >
              {[
                "Zero styles",
                "WAI-ARIA",
                "TypeScript",
                "Tree-shakeable",
                "React 19",
              ].map((tag) => (
                <span key={tag} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: 3D scene */}
          <div className="flex-shrink-0 hidden lg:block">
            <HeroScene />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Scrolling ticker */
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-y border-border/40 bg-muted/30 py-3">
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: "ticker-scroll 18s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-xs font-medium text-muted-foreground flex items-center gap-2"
          >
            <span className="h-1 w-1 rounded-full bg-border" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Feature card with 3D tilt on hover */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: (typeof FEATURES)[0] & { delay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springRotX = useSpring(rotX, { stiffness: 200, damping: 20 });
  const springRotY = useSpring(rotY, { stiffness: 200, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotX.set(((e.clientY - cy) / rect.height) * -12);
    rotY.set(((e.clientX - cx) / rect.width) * 12);
  };
  const handleLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="rounded-xl border bg-card p-6 shadow-sm cursor-default"
    >
      <motion.div
        style={{ translateZ: 20 }}
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border bg-muted"
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
      </motion.div>
      <motion.h3
        style={{ translateZ: 16 }}
        className="mb-2 text-sm font-semibold"
      >
        {title}
      </motion.h3>
      <motion.p
        style={{ translateZ: 12 }}
        className="text-sm text-muted-foreground leading-relaxed"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-b border-border/50 py-20"
      style={{ perspective: "1200px" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Why FrameUI?
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            The missing layer between
            <br />
            your design and your code.
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ComponentsSection() {
  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Components
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              14 headless primitives,
              <br />
              infinitely styleable.
            </h2>
          </motion.div>
          <Link
            href="/components/introduction"
            data-testid="link-all-components"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COMPONENTS_PREVIEW.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/components/${c.slug}`}
                data-testid={`link-component-card-${c.slug}`}
                className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm hover:border-foreground/30 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-xs font-mono font-medium text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  {c.label.slice(0, 2)}
                </div>
                <h3 className="text-sm font-semibold mb-1">{c.label}</h3>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="quick-start" className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Quick start
            </p>
            <h2 className="mb-5 text-3xl font-bold tracking-tight">
              Install once.
              <br />
              Style forever.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              FrameUI ships zero CSS. Every component receives your classes
              directly — no specificity wars, no overrides required.
            </p>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  label: "Install the package",
                  cmd: "npm install @frameui57/frame-ui",
                },
                {
                  step: "2",
                  label: "Import what you need",
                  cmd: "import { Modal } from 'FrameUI'",
                },
                {
                  step: "3",
                  label: "Add your own styles",
                  cmd: '<Modal className="your-styles">',
                },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  className="flex gap-4 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold mt-0.5">
                    {s.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium mb-0.5">{s.label}</p>
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {s.cmd}
                    </code>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rounded-xl border bg-muted/40 overflow-hidden shadow-sm"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/70">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="text-xs text-muted-foreground">Live demo</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <p className="text-xs text-muted-foreground">
                Click below to open a real FrameUI Modal.
              </p>
              <FrameButton
                label="Delete account"
                onClick={() => setIsOpen(true)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete your account."
        footerSlot={
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <FrameButton label="Cancel" onClick={() => setIsOpen(false)} />
            <FrameButton label="Confirm" onClick={() => setIsOpen(false)} />
          </div>
        }
      />
    </section>
  );
}

function ComparisonSection() {
  const cols = [
    {
      label: "FrameUI owns",
      color: "border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20",
      badge:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
      items: [
        "ARIA roles and attributes",
        "Keyboard navigation",
        "Controlled / uncontrolled state",
        "Compound subcomponents",
        "Native HTML element extension",
        "Screen reader semantics",
      ],
    },
    {
      label: "You own",
      color: "border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/20",
      badge:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
      items: [
        "All CSS and styling",
        "HTML structure",
        "Colors and typography",
        "Animations",
        "Component composition",
        "Design system tokens",
      ],
    },
    {
      label: "Both control",
      color: "border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20",
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
      items: [
        "Component API surface",
        "Compound subcomponents",
        "Event handler wiring",
        "Default + controlled state",
        "Composition via children",
        "TypeScript types",
      ],
    },
  ];

  return (
    <section className="border-b border-border/50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Philosophy
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            FrameUI handles the hard parts.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The semantic layer — so you can focus on the visual layer.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          {cols.map((col, i) => (
            <motion.div
              key={col.label}
              className={`rounded-xl border p-5 ${col.color}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span
                className={`mb-4 inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${col.badge}`}
              >
                {col.label}
              </span>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05] dark:opacity-[0.07]">
        <div
          className="h-[400px] w-[400px] rounded-full bg-indigo-500 blur-3xl"
          style={{ animation: "glow-pulse 5s ease-in-out infinite" }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <CubeLogo size={56} className="mx-auto mb-8" />
          <h2 className="mb-5 text-4xl font-bold tracking-tight">
            Start building today.
          </h2>
          <p className="mb-10 text-lg text-muted-foreground max-w-md mx-auto">
            14 components. Zero styles. Full accessibility. Works with any CSS
            system.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/components/introduction"
              data-testid="link-cta-browse"
              className="group inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-md"
            >
              Browse components
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              data-testid="link-cta-github"
              className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <SiGithub className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <InlineLogo size={20} />
          <span className="font-medium text-foreground">FrameUI</span>
          <span className="text-border">·</span>
          <span>Headless React UI</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/components/introduction"
            className="hover:text-foreground transition-colors"
          >
            Components
          </Link>
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Page                                                        */
/* ─────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <HeroSection />
        <Ticker />
        <FeaturesSection />
        <ComponentsSection />
        <CodeSection />
        <ComparisonSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
