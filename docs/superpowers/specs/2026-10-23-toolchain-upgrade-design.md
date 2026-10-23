# Toolchain & Dependency Upgrade — Design

Date: 2026-10-23
Status: Draft (awaiting approval)

## Intent

This repo is a **boilerplate** that gets cloned as the starting point for new
projects. It is not the base of any running app, so nothing downstream depends
on it. The goal is that every fresh clone starts on the newest, fastest toolchain
with the least config possible.

Concretely, the owner wants:

- **Vite+** (`vite-plus`) to replace ESLint, Prettier and lint-staged.
- **TypeScript 7** (the native Go compiler) for faster type checking.
- **Node 24** and **pnpm 12**.
- Every other dependency bumped to its latest version, including majors.

## Goals

1. Tooling: Node 24, pnpm 12, Vite 8 (via Vite+), TypeScript 7, Vite+ for
   lint / format / type-check / staged-file checks / git hooks.
2. Remove ESLint, Prettier, lint-staged, husky and all their plugins and config files.
3. Bump all runtime dependencies to latest, including majors, and fix the code
   they break.
4. Fix pre-existing repo hygiene issues found during recon (see below).
5. Update README to match the new stack.

## Non-goals

- No new features. In particular, **no test setup** (Vitest ships inside Vite+,
  but adding tests is out of scope).
- No re-generation or restyling of shadcn/ui components beyond what upgrades require.
- No change to app behavior, routes, theme, or UI.

## Anti-goals (would count as failure even if it "works")

- The code style changes visibly on a fresh `format` run. The formatter must
  reproduce the current style (see "Formatting" below).
- Keeping ESLint around "just in case", or running ESLint JS plugins through
  oxlint to preserve rules. The owner explicitly chose to drop rules with no
  oxlint equivalent.
- Type errors do not fail the build or the pre-commit check. (Today's hook does
  not type-check at all; after the upgrade it must.)

## Success criteria

All of these pass on Node 24 with a fresh clone (`rm -rf node_modules && pnpm install`):

- `pnpm install` completes with no peer-dependency errors and produces a committed `pnpm-lock.yaml`.
- `pnpm dev` starts the app and the existing pages (home, login, register, 404)
  render and behave as before, including light/dark/system theme switching and
  the dropdown menu animation.
- `pnpm build` succeeds, and fails if a deliberate type error is introduced.
- The lint / format / type-check command (`vp check` or equivalent) exits clean.
- A `git commit` runs the staged-file checks via the Vite+ git hook.

## Decisions made with the owner

| Topic | Decision |
|---|---|
| Node version | **Node 24** (not 26, even though 26 enters LTS on 2026-10-28). |
| Breaking changes | Allowed freely, including code changes, since this is a boilerplate. |
| Lint rules with no oxlint equivalent | **Drop them.** Do not use ESLint JS plugins. |
| Git hooks | **Drop husky**, use Vite+ built-in hooks (`vp hooks` / `.vite-hooks/pre-commit`). |
| Code style | Keep the current style (owner confirmed the playback). |
| Tests | Not in scope. |

## Current state (recon, 2026-10-23)

- Node `.nvmrc` = `22.14.0`, `engines.node` = `22.x`, `packageManager` = `pnpm@10.33.0`.
- **No `pnpm-lock.yaml`** exists in the repo (not ignored, just never committed).
- `.npmrc` contains only `legacy-peer-deps = true`, an npm setting that pnpm ignores.
- `.husky/pre-commit` runs `npm run lint-staged`. `prepare` runs `husky && husky install` (the second part is deprecated).
- `tsconfig.json` uses `baseUrl: "."` plus `paths: { "@/*": ["./src/*"] }`. TS 7 removed `baseUrl`.
- `vite.config.ts` uses `@vitejs/plugin-react-swc` and `@tailwindcss/vite`, with an `@` alias via `path.resolve(__dirname, './src')`.
- `src/index.css` uses `@plugin 'tailwindcss-animate'`. `dropdown-menu.tsx` relies on `animate-in` / `fade-*` / `zoom-*` / `slide-in-*` utilities.
- `react-router-dom` is imported in 12 files.
- zod is used in `src/validations/auth.schema.ts` and `src/configs/env.ts`. `zodResolver` is used in `src/pages/auth/components/login-form.tsx`.
- lucide icons used: `Monitor, Moon, Sun, EyeIcon, EyeOffIcon, CircleAlert, CircleCheck, Info, TriangleAlert, CheckIcon, ChevronRightIcon, CircleIcon, Loader2`. None are brand icons.
- `src/hooks/use-query-params.ts` uses the `queryString.ParseOptions` / `queryString.StringifyOptions` namespace-style types.
- Existing `eslint-disable` comments: `theme-provider.tsx:40`, `app-route.tsx:37` (react-hooks/exhaustive-deps), `use-query-params.ts:1`, `storage.ts:13` (no-explicit-any).

## Target versions (npm registry, 2026-10-23)

| Package | From | To | Notes |
|---|---|---|---|
| Node | 22.x | **24.x** (latest 24.22.1) | Vite+ requires `^24.11.0` on the 24 line. |
| pnpm | 10.33.0 | **12.15.0** | |
| typescript | ^5.7 | **7.0.2** | Native compiler. `baseUrl` removed. |
| vite | ^6.2 | Vite 8 via **vite-plus 1.4.0** | Vite+ aliases `vite` to `@voidzero-dev/vite-plus-core`. Vite+ 1.0 shipped 2026-09-28, so it is young and releases weekly. |
| @vitejs/plugin-react-swc | ^3.8 | replaced by **@vitejs/plugin-react 6.x** | My call, see below. |
| tailwindcss, @tailwindcss/vite | ^4.0 | 4.3.x | |
| tailwindcss-animate | 1.0.7 | replaced by **tw-animate-css 1.4.x** | Current shadcn recommendation for Tailwind v4. |
| react, react-dom | ^19.0 | 19.3.x | |
| @types/react, @types/react-dom | ^19.0 | 19.3.x | |
| @types/node | ^22 | ^24 | Match the Node major we run on. |
| react-router-dom | ^7.3 | replaced by **react-router 8.x** | v8 drops `react-router-dom`. Requires React ≥ 19.2.7, Node ≥ 22.22. |
| zod | ^3.24 | **4.x** | |
| @hookform/resolvers | ^4.1 | **6.x** | Peer: zod ^3.25 or ^4, react-hook-form ^7.55. |
| react-hook-form | ^7.54 | 7.90.x | Stay on v7. v8 is beta only. |
| lucide-react | ^0.482 | **1.x** | Brand icons removed (none used). |
| query-string | ^9.2 | **10.x** | |
| axios, @tanstack/react-query, zustand, sonner, tailwind-merge, clsx, class-variance-authority, @radix-ui/* | various | latest within same major | |
| eslint, @eslint/js, typescript-eslint, eslint-plugin-*, globals, prettier, @trivago/prettier-plugin-sort-imports, prettier-plugin-tailwindcss, husky, lint-staged | — | **removed** | |

## The how

### Package manager & runtime

- `packageManager: "pnpm@12.15.0"`, `engines: { node: ">=24.11.0 <25", pnpm: "12.x" }`, `.nvmrc` → `24`.
- Delete `.npmrc` (its only setting is npm-specific). If pnpm 12 needs settings
  (for example allowing build scripts), put them where pnpm 12 expects them.
- Commit `pnpm-lock.yaml`.

### Vite+

- Install `vite-plus`. Start from `vp migrate` because it rewrites imports,
  merges config into `vite.config.ts` and updates scripts. Then review and adjust
  by hand; the Vite+ docs say most projects need manual follow-up. Note that
  `vp migrate` wants Vite 7+ already in place, so bump Vite first or migrate in
  the order the docs prescribe.
- `vite.config.ts` imports `defineConfig` from `vite-plus` and holds the `lint`,
  `fmt` and `staged` blocks. No separate `.oxlintrc*` / `.oxfmtrc*` files.
- Scripts keep their current names so the developer muscle memory stays the same:
  `dev` (keep `--open --host`), `build`, `start` (preview), `lint`, `lint:fix`,
  `format`, plus a `check` script for the combined fmt + lint + type-check.
  Map them to `vp` commands.

### Formatting (oxfmt via `vp fmt`)

Reproduce the current `.prettierrc`:

- `singleQuote: true`, `jsxSingleQuote: false`, `semi: true`, `trailingComma: "all"`,
  `arrowParens: "always"`, `tabWidth: 2`, `useTabs: false`, `printWidth: 120`.
- `endOfLine: "auto"` is unsupported in oxfmt → use `"lf"` (matches `.editorconfig`).
- Import sorting (built into oxfmt, off by default → enable it) must reproduce the current groups, separated by blank lines, with specifiers sorted:
  1. `react`
  2. third-party modules
  3. `@/components/**`
  4. other `@/**`
  5. relative imports
- Tailwind class sorting (built into oxfmt) → enable it and point it at `src/index.css`.
- Ignore `dist`, `node_modules`, `public` (current `.prettierignore`).
- **My call: keep the formatter scope at JS/TS/JSX/TSX**, as it is today. Oxfmt
  can also format CSS, Markdown, HTML and JSON, but Prettier never touched those
  here. Formatting them would reformat `README.md`, `src/index.css`,
  `index.html` and the docs, which the anti-goal forbids.
- Disable `sortPackageJson` unless it is harmless. The goal is not to churn `package.json` ordering.

The check is a format run on the migrated tree that produces **no style diff**
beyond import-group or class-order differences that oxfmt cannot express. List
any of those in the PR description.

### Linting (oxlint via `vp lint`)

Map each current ESLint rule to its oxlint equivalent. **Drop any rule with no
equivalent.** Do not add ESLint JS plugins. Expected mapping, to be verified
against the oxlint version bundled with Vite+:

| Current rule | Intent |
|---|---|
| `js.configs.recommended`, `tseslint.configs.recommended` | oxlint default correctness set + typescript plugin |
| `react-hooks` recommended | oxlint react plugin: `rules-of-hooks`, `exhaustive-deps` |
| `react-refresh/only-export-components` | currently **off** → leave off |
| `no-console: error` | keep |
| `newline-before-return: error` | probably no equivalent → drop |
| `@typescript-eslint/no-unused-vars: warn`, `no-unused-vars` (`^_` ignore patterns), `unused-imports/*` | oxlint `no-unused-vars` with the same `^_` ignore patterns. Unused imports must be auto-fixable (`--fix`). |
| `@typescript-eslint/no-explicit-any: warn` | keep as warn |
| `@typescript-eslint/no-use-before-define: error` | keep if available |
| `no-duplicate-imports: warn` | keep if available |
| `react/jsx-key` (with `checkFragmentShorthand`, `checkKeyMustBeforeSpread`, `warnOnDuplicates`) | keep. Drop unsupported options. |
| `react/react-in-jsx-scope: off`, `react/prop-types: off` | keep off |
| `no-multiple-empty-lines` | formatter handles it → drop |
| `no-restricted-imports: error` (no options, effectively a no-op) | drop |
| `no-empty` (`allowEmptyCatch: true`) | keep if the option is supported |
| `eqeqeq: off`, `no-empty-interface: off`, `strict-boolean-expressions: off`, `space-before-function-paren: off` | leave off / not applicable |

Ignore patterns carry over: `dist`, `node_modules`, `public`, `build`, `src/assets`, `*.md`.

Existing `eslint-disable` comments: convert them to the oxlint form
(`oxlint-disable-next-line` / `eslint-disable` if oxlint honors it). Remove any
that become unnecessary.

### Type checking

- Type errors must fail `pnpm build` and the pre-commit check.
- Preferred: Vite+ type-aware lint with type checking (`lint.options.typeAware` +
  `typeCheck`, powered by tsgolint on TS 7) inside `vp check`.
- Whether `vp check` fully replaces `tsc -b` is **not confirmed** by the Vite+ docs.
  The builder verifies it with a deliberate type error. If it is not a full
  replacement, keep a TS 7 `tsc` (`tsc --noEmit` or `tsc -b`) step in `build`.
- Review note: `vp check --no-fmt --no-lint` runs the type check alone. Use that
  (or `tsc`) in `build`, so a build fails on type errors but not on format or lint issues.

### TypeScript config

- Remove `baseUrl`. Keep `paths: { "@/*": ["./src/*"] }` (already relative-anchored).
- Remove or replace any other option TS 7 rejects. Keep the current strictness flags.
- Bump `target` / `lib` from ES2020 to something modern (for example ES2022 or newer)
  if Vite 8's default browser targets allow it. This is the builder's call.

### Vite config

- Replace `@vitejs/plugin-react-swc` with `@vitejs/plugin-react` v6. **My call:**
  Vite 8 runs on Rolldown/Oxc, and plugin-react v6 uses Oxc, so SWC becomes a
  redundant second transformer. If this causes a problem, staying on
  `plugin-react-swc` latest (it supports Vite 8) is acceptable.
- `__dirname` in an ESM config: replace with `import.meta.dirname` or
  `fileURLToPath`, or use Vite's native tsconfig-paths support if Vite 8 has it.
  This is the builder's call.

### Git hooks & staged checks

- Remove husky (`.husky/`, the `prepare` script and the dependency).
- Use the Vite+ hook (`.vite-hooks/pre-commit`, `vp hooks`) running `vp staged`.
- The `staged` block in `vite.config.ts` runs lint-fix + format on staged
  `*.{js,jsx,ts,tsx}` (today's lint-staged scope).
- **My call:** the pre-commit hook also runs a whole-project type check (TS 7 on
  ~60 files is fast). This satisfies the anti-goal above.
- Hooks must install automatically after `pnpm install` on a fresh clone. The
  review found that `vp config` in a `prepare` script installs them; verify that.

### Runtime dependency code changes

- **React Router 8:** uninstall `react-router-dom`, install `react-router`, and
  change all 12 imports to `react-router`. `BrowserRouter` / DOM-specific APIs
  come from `react-router` or `react-router/dom` per the v8 docs.
- **zod 4 + @hookform/resolvers 6:** update `auth.schema.ts`, `env.ts` and
  `login-form.tsx` as needed. Keep the custom error messages working, since
  zod 4 changed the error-message API.
- **lucide-react 1.x:** check that every icon listed above still exists under the
  same name (for example `Loader2` may now be an alias of `LoaderCircle`). Rename if needed.
- **tw-animate-css:** replace `@plugin 'tailwindcss-animate'` with
  `@import 'tw-animate-css'`, then confirm the dropdown open/close animation still works.
- **query-string 10:** fix the namespace-style type usage in `use-query-params.ts`
  if v10 changed its type exports.
- **Radix:** stay on the individual `@radix-ui/react-*` packages (latest). Do not switch to the `radix-ui` umbrella package (out of scope).

### Files removed

`eslint.config.js`, `.prettierrc`, `.prettierignore`, `.husky/`, `.npmrc`, and
the `lint-staged` block in `package.json`.

### Docs

- README: update the Features, Technologies Used and Project Structure sections
  (Vite+, TS 7, Node 24, pnpm 12, React Router 8, zod 4, lucide 1.x). Remove the
  ESLint/Prettier/Husky/lint-staged mentions and the `yarn.lock / package-lock.json`
  row, and add `pnpm-lock.yaml`.

### Uncommitted changes already in the working tree

At design time, the working tree has `CLAUDE.md` and `AGENTS.md` deleted and a
`.gitignore` edit (adding `graphify-out`). None of this is part of the upgrade.
Leave them alone, stage files explicitly so they stay out of the upgrade
commits, and run `vp migrate` / `vp config` with agent- and editor-file setup
turned off.

## Constraints

- The developer machine currently runs Node 22.23.4. Node 24 must be installed
  (for example `nvm install 24`) before running the new toolchain.
- The project `CLAUDE.md` requires GitNexus impact analysis before editing
  symbols and `gitnexus_detect_changes()` before committing.
- Commit messages must not carry AI/model attribution (owner's global rule).

## Left to the builder

- Order of operations (for example bump Vite first, then run `vp migrate`) and how to split commits.
- Exact oxlint rule names and option support.
- Whether `vp check` replaces `tsc`. Verify by experiment as described above.
- `target` / `lib` bump, alias resolution approach in `vite.config.ts`.
- pnpm 12 settings location, if any are needed.
