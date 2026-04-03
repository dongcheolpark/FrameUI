# FrameUI Agent Guidelines

This document provides context and guidelines for AI agents working on the **FrameUI** project. FrameUI is an unstyled, headless UI component framework for React.

## 🎯 Project Overview & Philosophy

FrameUI focuses on delivering unstyled React components with embedded state logic. The core philosophies you must follow when contributing are:

1. **Unstyled by Default:** Components must not include any default styling (CSS, Tailwind, etc.). Users will provide their own styles.
2. **Accessibility First (WAI-ARIA):** All components must handle essential accessibility requirements, including focus management, keyboard navigation, and proper ARIA attributes.
3. **`asChild` Pattern:** Support the `asChild` prop pattern using Radix-like Slot components to merge props without introducing unnecessary DOM wrappers.
4. **Progressive Component Extension:** Components should be simple out of the box but allow users to composing complex UI using sub-components (e.g., `Dropdown.Trigger`, `Dropdown.Menu`).

## 🧱 Project Structure

The repository is set up as a **pnpm workspace** with two main isolated areas:

- **Root (`./`)**: The core FrameUI library source code, built using `tsdown`.
- **Demo App (`./app/`)**: A Vite + React application used for manual and visual testing of the library components. This app references the root workspace packages (`workspace:*`).

## 🚀 Environment and Scripts

You will use `pnpm` exclusively for this project.

### Core Library Tasks
- **Install Dependencies:** `pnpm install`
- **Build Library:** `pnpm build` (Uses `tsdown`. Output goes to `dist/`)
- **Type Checking:** `pnpm typecheck`
- **Clean output:** `pnpm clean`

### Testing
We use **Vitest**, **Testing Library**, and **happy-dom**.
- **Run Tests Once:** `pnpm test`
- **Watch Mode:** `pnpm test:watch`

### Demo Application (Visual Verification)
- **Start Dev Server:** `pnpm app:dev` (Verify interactive behaviors here)
- **Build Demo:** `pnpm app:build`
- **Preview Build:** `pnpm app:preview`

## 🧪 Recommended Development Workflow

When implementing or modifying a component, follow this exact sequence:

1. **Implementation:** Write or modify the component logic and hooks in the `src/` directory.
2. **Testing:** Create or update tests in corresponding `src/**/*.test.tsx` files.
3. **Regression Check:** Run `pnpm test` to ensure all existing and new tests pass.
4. **Build Check:** Run `pnpm build` to verify the library bundles properly without type errors.
5. **Visual/Interactive Verification:** Run `pnpm app:dev` to test the actual user interaction and rendering in the demo environment. 

Ensure you do not introduce external dependencies unnecessarily, and always respect the headless nature of the project.
