# react-shadcn-tailwind-boilerplate

**react-shadcn-tailwind-boilerplate** is a boilerplate that uses **React**, **Tailwind CSS**, **Shadcn UI** and comes pre-configured with various useful libraries such as `axios`, `react-hook-form`, `zustand`, `zod`, etc. The goal is to help you quickly initialize a frontend project with an easily extensible architecture, strict linting rules, and consistent code style.

---

## Features

- **React 19 + Vite 8**: Uses the latest version of React with Vite for faster development, build, and hot reload.
- **Tailwind CSS**: Pre-configured with Tailwind CSS 4.x, allowing you to quickly and flexibly style your application.
- **ShadCN**: Includes some configurations and components inspired by [shadcn/ui](https://ui.shadcn.com/).
- **Vite+**: One toolchain for linting (Oxlint), formatting (Oxfmt) and type checking (TypeScript 7), with a type-aware lint and import and Tailwind class sorting.
- **Pre-commit hook**: Vite+ runs lint, format and a whole-project type check on commit, so a type error anywhere blocks the commit.
- **axios**: A popular library for making API calls.
- **react-hook-form**: Efficient and easy form management.
- **zod**: Safe data parsing and validation.
- **zustand**: Lightweight, straightforward global state management.
- **React Router**: Routing for your application (version 8.x).
- **Sonner**: A lightweight toast/notification library.

---

## Technologies Used

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 7.x
- [Vite](https://vite.dev/) 8.x, through [Vite+](https://viteplus.dev/)
- [Tailwind CSS](https://tailwindcss.com/) 4.x
- [React Router](https://reactrouter.com/) 8.x
- [zod](https://zod.dev/) 4.x
- [Node.js](https://nodejs.org/) 24
- [pnpm](https://pnpm.io/) 12

---

## Project Structure

This document describes the structure of the project directory and the purpose of each file/folder.

| Directory/File                  | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| `.vite-hooks/`                  | Vite+ git hooks (pre-commit)                       |
| `.vscode/`                      | VSCode configuration (if any)                      |
| `node_modules/`                 | Directory for installed node packages              |
| `public/`                       | Contains static files (favicon, manifest, ...)     |
| `src/apis/`                     | API call functions (axios)                         |
| `src/assets/`                   | Images, media files, ...                           |
| `src/components/`               | Shared components                                  |
| `src/configs/`                  | Configurations, e.g., axios setup, ...             |
| `src/constants/`                | Contains constants, enums, ...                     |
| `src/layouts/`                  | Application's main layouts                         |
| `src/lib/`                      | Libraries, reusable helper functions               |
| `src/routes/`                   | Application routes (React Router)                  |
| `src/store/`                    | State management (zustand)                         |
| `src/utils/`                    | Utility functions, helper functions                |
| `src/App.tsx`                   | Root component of the application                  |
| `src/index.css`                 | Global CSS file (import tailwind)                  |
| `src/index.tsx`                 | Entry point for rendering React                    |
| `src/vite-env.d.ts`             | Type declarations for Vite                         |
| `.editorconfig`                 | Code formatting rules for multiple editors         |
| `.env`                          | Main environment variables (not committed to repo) |
| `.env.example`                  | Example .env file                                  |
| `.nvmrc`                        | Specifies NodeJS version for the project           |
| `index.html`                    | Root HTML file for Vite                            |
| `package.json`                  | Project information and configuration              |
| `README.md`                     | Documentation and project description              |
| `tsconfig.json`                 | TypeScript configuration                           |
| `pnpm-lock.yaml`                | Lock file for dependencies                         |
| `vite.config.ts`                | Vite+ configuration (build, lint, format, staged)  |

## Clone repo:

```bash
git clone https://github.com/lofadev/react-shadcn-tailwind-boilerplate.git
```

## Node version:

```json
>= 24.11.0 < 25
```

## Install dependencies:

```bash
cd react-shadcn-tailwind-boilerplate
pnpm install
```

## Create a .env file (if necessary) based on .env.example:

```bash
cp .env.example .env
```

## Start the development server:

```bash
pnpm dev
```

## Build the project for production:

```bash
pnpm build
```

## Preview the production build:

```bash
pnpm start
```

## Scripts:

| Script           | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `pnpm dev`       | Start the development server                                    |
| `pnpm build`     | Type check, then build for production                           |
| `pnpm start`     | Preview the production build                                    |
| `pnpm lint`      | Lint with Oxlint (type-aware)                                   |
| `pnpm lint:fix`  | Lint and auto-fix, including removing unused imports            |
| `pnpm format`    | Format with Oxfmt                                               |
| `pnpm check`     | Format check, lint and type check in one run                    |
