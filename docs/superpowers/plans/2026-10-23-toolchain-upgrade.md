# Toolchain & Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the boilerplate to Node 24, pnpm 12, Vite 8 via Vite+, and TypeScript 7, replace ESLint/Prettier/lint-staged/husky with Vite+, and bump every runtime dependency to latest.

**Architecture:** Change one layer at a time and keep the app building after every task: runtime → runtime deps → bundler → Vite+ (with formatter, so a format diff can be measured against a prettier-clean tree) → lint rules → commit hooks → docs. The repo has no test suite and adding one is out of scope. Each task's "test" is a command whose output proves the change: a build, a check, a deliberate-failure probe, or a browser smoke check.

**Tech Stack:** Node 24, pnpm 12.15.0, vite-plus 1.4.x (Vite 8, Oxlint, Oxfmt, tsgolint), TypeScript 7.0.2, React 19.3, React Router 8, Tailwind 4.3, zod 4.

**Spec:** `docs/superpowers/specs/2026-10-23-toolchain-upgrade-design.md`

## Global Constraints

- Node: `.nvmrc` = `24`; `engines.node` = `">=24.11.0 <25"`. Vite+ requires `^24.11.0` on the 24 line. Do not move to Node 26.
- pnpm: `packageManager` = `"pnpm@12.15.0"`; `engines.pnpm` = `"12.x"`.
- `@types/node` major = 24.
- Breaking upgrades are allowed, but app behavior, routes, theme and UI must not change.
- Lint rules with no oxlint equivalent are **dropped**. Never add ESLint JS plugins (`lint.jsPlugins`) to keep a rule.
- Formatter scope stays at `*.{js,jsx,ts,tsx}`. CSS, Markdown, HTML and JSON are not formatted.
- Code style must not change: `singleQuote`, `jsxSingleQuote: false`, `semi`, `trailingComma: "all"`, `arrowParens: "always"`, `tabWidth: 2`, `printWidth: 120`, `endOfLine: "lf"`, same import groups.
- Type errors must fail `pnpm build` and the pre-commit hook.
- No test setup (Vitest) and no new features.
- Keep the individual `@radix-ui/react-*` packages; keep `react-hook-form` on v7.
- **Do not stage or commit** the pre-existing working-tree changes: deleted `CLAUDE.md`, deleted `AGENTS.md`, modified `.gitignore`. Always `git add` explicit paths, never `git add -A` / `git add .`.
- Commit messages: conventional style (`feat:`, `chore:`, `refactor:`, `docs:`), no AI/model attribution or co-author trailers.
- Never use `git commit --no-verify`.
- Run `vp migrate` / `vp config` with agent-file and editor-file setup turned off.
- In shell steps, call the project-local CLI as `pnpm exec vp …`. Git hook files may use bare `vp`.
- The repo has no `.env`, only `.env.example`. Wherever the app must run, create one with `cp .env.example .env` (it is gitignored).
- GitNexus (project rule: impact analysis before editing symbols, `detect_changes` before commits) was neither installed nor reachable at plan time. If its tools are available during execution, follow that rule.

## Review Focus

1. **Fresh clone on a machine that never ran husky.** `pnpm install` must leave a working pre-commit hook with no manual step. Owned by Task 6 (fresh-clone hook probe).
2. **Theme and dropdown animation after `tw-animate-css`.** The dropdown must still fade/zoom/slide on open and close, in light and dark. Owned by Task 2 (browser smoke step).
3. **Login form validation messages after zod 4 + resolvers 6.** Submitting an empty form must still show `Username is required!` and `Password is required!`. Owned by Task 2 (browser smoke step).
4. **Missing `VITE_API_URL`.** The app must still throw `Chưa thiết lập biến môi trường đầy đủ` at startup under zod 4. Owned by Task 2 (env probe step).
5. **Committing a file with a type error elsewhere in the project.** The hook must reject the commit even if the staged file itself is fine. Owned by Task 6 (type-error commit probe).

---

### Task 1: Node 24 + pnpm 12 baseline with lockfile

Establish the runtime and a prettier-clean, buildable baseline on the **old** toolchain. Every later diff is measured against this baseline.

**Files:**
- Modify: `.nvmrc`, `package.json` (`packageManager`, `engines`)
- Delete: `.npmrc`
- Create: `pnpm-lock.yaml`

**Interfaces:**
- Produces: a commit whose `src/` is exactly prettier-formatted (Task 4's zero-diff check relies on it), and a working `pnpm` 12 under Node 24.

- [ ] **Step 1: Switch runtime**

Run: `nvm install 24 && nvm use 24 && node -v`
Expected: `v24.x` with x ≥ 11.

- [ ] **Step 2: Activate pnpm 12**

Set `packageManager` to `pnpm@12.15.0`, then run `corepack enable pnpm && pnpm -v` in the repo. If corepack is unavailable, use `npm i -g pnpm@12.15.0`.
Expected: `12.15.0`.

- [ ] **Step 3: Update `.nvmrc` to `24` and `engines` to `{ "node": ">=24.11.0 <25", "pnpm": "12.x" }`, and delete `.npmrc`**

- [ ] **Step 4: Install**

Run: `pnpm install`
Expected: success and a new `pnpm-lock.yaml`. If pnpm reports ignored build scripts or peer conflicts, configure them in `pnpm-workspace.yaml` (pnpm 12's settings file), not `.npmrc`.

- [ ] **Step 5: Verify the baseline builds and is prettier-clean**

Run: `pnpm build && pnpm lint && pnpm format && git status --short src`
Expected: build and lint succeed, and `git status` lists **no** `src/` changes. If prettier changed files, commit them separately first as `style: apply prettier formatting` so the baseline is clean.

- [ ] **Step 6: Commit**

```bash
git add .nvmrc package.json pnpm-lock.yaml .npmrc
git commit -m "chore: move to node 24 and pnpm 12, commit lockfile"
```

(`git add .npmrc` stages its deletion. Add `pnpm-workspace.yaml` if Step 4 created it.)

---

### Task 2: Upgrade runtime dependencies and fix code

Still on the old toolchain (Vite 6, TS 5, ESLint), so any breakage here comes from the runtime libraries alone.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `src/index.css:3`
- Modify (imports `react-router-dom` → `react-router`): `src/App.tsx`, `src/components/header.tsx`, `src/hooks/use-query-params.ts`, `src/routes/private.tsx`, `src/routes/rbac-route.tsx`, `src/routes/global.tsx`, `src/routes/app-route.tsx`, `src/routes/public.tsx`, `src/layouts/default.tsx`, `src/layouts/auth.tsx`, `src/pages/auth/components/login-form.tsx`, `src/pages/home/index.tsx`
- Modify if needed: `src/validations/auth.schema.ts`, `src/configs/env.ts`, `src/hooks/use-query-params.ts` (query-string types), any file using a renamed lucide icon

**Interfaces:**
- Produces: no new symbols. All public exports in `src/` keep their names and signatures.

- [ ] **Step 1: Write the failing probe**

Run: `grep -rln "react-router-dom\|tailwindcss-animate" src package.json`
Expected now: 13 files plus `package.json`. After this task: no output.

- [ ] **Step 2: Swap and bump packages**

Run:
```bash
pnpm remove react-router-dom tailwindcss-animate
pnpm add react-router@latest tw-animate-css@latest zod@latest @hookform/resolvers@latest \
  lucide-react@latest query-string@latest react@latest react-dom@latest react-hook-form@^7 \
  axios@latest @tanstack/react-query@latest zustand@latest sonner@latest tailwind-merge@latest \
  clsx@latest class-variance-authority@latest tailwindcss@latest @tailwindcss/vite@latest \
  @radix-ui/react-dropdown-menu@latest @radix-ui/react-label@latest @radix-ui/react-slot@latest
pnpm add -D @types/react@latest @types/react-dom@latest @types/node@^24
```
Expected: react-router 8.x, zod 4.x, @hookform/resolvers 6.x, lucide-react 1.x, query-string 10.x, react 19.3.x, react-hook-form 7.x.

- [ ] **Step 3: Rewrite imports**

Change every `from 'react-router-dom'` to `from 'react-router'`. If the v8 docs place a DOM-only API (e.g. `BrowserRouter`) under `react-router/dom`, import it from there. In `src/index.css`, replace `@plugin 'tailwindcss-animate';` with `@import 'tw-animate-css';` and place it directly after `@import 'tailwindcss';`.

- [ ] **Step 4: Run the build to surface breakage**

Run: `pnpm build`
Expected: either PASS, or type errors limited to zod 4 / resolvers 6 / lucide icon names / query-string types. Fix each at its call site without changing behavior:
- zod 4: keep the custom messages `'Username is required!'` and `'Password is required!'`.
- lucide: if an icon such as `Loader2` was renamed, use the new name.
- query-string 10: if the `queryString.ParseOptions` / `queryString.StringifyOptions` namespace types are gone, import the named types instead.

- [ ] **Step 5: Verify build, lint, format and probe**

Run: `pnpm build && pnpm lint && pnpm format && git diff --stat -- src && grep -rln "react-router-dom\|tailwindcss-animate" src package.json`
Expected: build and lint pass, and grep prints nothing. `pnpm format` may touch only the files you edited in this task, so `src/` stays prettier-clean for Task 4's zero-diff test.

- [ ] **Step 6: Env probe (Review Focus 4)**

With **no** `.env` file and `VITE_API_URL` unset in the shell, run `pnpm dev`, open `/` and read the browser console. Do not test with an empty string: `z.string()` accepts `''`.
Expected: uncaught error `Chưa thiết lập biến môi trường đầy đủ`.

- [ ] **Step 7: Browser smoke (Review Focus 2, 3)**

Run `cp .env.example .env`, run `pnpm dev`, and check:
- `/` renders, then navigate to the login page via its link. The register page also renders.
- Submit an empty login form → `Username is required!` and `Password is required!` appear.
- The theme dropdown opens and closes with its fade/zoom animation. Switch light → dark → system, and the theme applies each time.
- An unknown URL shows the 404 page.

Expected: all behave as on the baseline commit.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml src
git commit -m "feat: upgrade runtime dependencies to latest majors"
```

---

### Task 3: Vite 8 + @vitejs/plugin-react v6

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`, `vite.config.ts`

**Interfaces:**
- Produces: `vite.config.ts` on Vite 8 with `@vitejs/plugin-react`, `@tailwindcss/vite` and the `@` → `./src` alias. Task 4 converts this file to `vite-plus`.

- [ ] **Step 1: Swap the React plugin and bump Vite**

Run: `pnpm remove @vitejs/plugin-react-swc && pnpm add -D vite@^8 @vitejs/plugin-react@^6`

- [ ] **Step 2: Update `vite.config.ts`**

Import `react` from `@vitejs/plugin-react`. Replace `path.resolve(__dirname, './src')` with an ESM-safe form (`fileURLToPath(new URL('./src', import.meta.url))`, or Vite 8's built-in tsconfig paths support if it covers `@/*`). Remove the `path` import if it becomes unused.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm lint`, then `pnpm dev` and load `/` with HMR (edit a heading, see it update without a full reload, then revert).
Expected: all pass. The `@/` imports resolve.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts
git commit -m "chore: upgrade to vite 8 and @vitejs/plugin-react 6"
```

---

### Task 4: Migrate to Vite+ with TypeScript 7 and a style-preserving formatter

ESLint/typescript-eslint cannot run on TS 7, so TS 7, the Vite+ migration and the ESLint/Prettier removal happen together. The formatter is tuned in this same task. That way "no style change" is measured as zero diff against the prettier-clean `src/` from HEAD.

**Files:**
- Modify: `package.json` (scripts, deps), `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig.json`, possibly `src/vite-env.d.ts` (if `vite/client` must become a `vite-plus` type reference)
- Delete: `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.husky/`, the `lint-staged` block in `package.json`

**Interfaces:**
- Produces: `vite.config.ts` importing `defineConfig` from `vite-plus`, with `fmt`, `lint` (rules may still be migrator defaults, finished in Task 5), `staged` (finished in Task 6) and `lint.options = { typeAware: true, typeCheck: true }`.
- Produces: scripts `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `check`, `prepare`, consumed by Tasks 5–7:
  - `dev`: `vp dev --open --host`
  - `build`: `vp check --no-fmt --no-lint && vp build`
  - `start`: `vp preview`
  - `lint`: `vp lint`
  - `lint:fix`: `vp lint --fix`
  - `format`: `vp fmt`
  - `check`: `vp check`
  - `prepare`: `vp config` with the flags that skip agent/editor files (exact flags from `vp config --help`)

- [ ] **Step 1: Remove husky before migrating**

Delete `.husky/`, the `prepare` script and the `husky` dependency. Then run `git config --unset core.hooksPath || true`.
Why: `vp migrate` only migrates lint-staged into a `staged` block and installs its own hook when no other hook tool owns the workflow.

- [ ] **Step 2: Install Vite+ and TypeScript 7**

Run: `pnpm add -D vite-plus@latest typescript@7.0.2`

- [ ] **Step 3: Run the migrator**

Run `pnpm exec vp migrate --help`, then run `pnpm exec vp migrate` non-interactively with agent- and editor-file setup turned off.
Expected: `vite.config.ts` imports from `vite-plus`, ESLint/Prettier config is merged into it, and the old packages are removed or flagged.

- [ ] **Step 4: Remove what the migrator left**

Remove from `devDependencies` anything still present from: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-unused-imports`, `globals`, `prettier`, `@trivago/prettier-plugin-sort-imports`, `prettier-plugin-tailwindcss`, `lint-staged`, `husky`. Remove `vite` if Vite+ now provides it. Delete `eslint.config.js`, `.prettierrc` and `.prettierignore` if they still exist. Set the scripts exactly as in Interfaces above. Discard any agent/editor files the migrator created (e.g. `AGENTS.md`, `CLAUDE.md`, `.vscode/*`). Those paths have pre-existing uncommitted deletions that must stay untouched.

- [ ] **Step 5: Fix `tsconfig.json` for TS 7**

Remove `baseUrl`. Keep `paths: { "@/*": ["./src/*"] }` and all strictness flags. Remove or replace any other option TS 7 rejects. Optionally raise `target`/`lib` from `ES2020` to `ES2022` (builder's call, spec).

- [ ] **Step 6: Verify the build passes**

Run: `pnpm build`
Expected: PASS with no tsconfig errors or warnings.

- [ ] **Step 7: Type-check probe: the build must go red on a type error**

Append `export const __probe: number = 'x';` to `src/lib/utils.ts`.
Run: `pnpm build`
Expected: FAIL with a type error pointing at `src/lib/utils.ts`. If it passes, `vp check --no-fmt --no-lint` is not type-checking. Fix `lint.options` or fall back to `tsc --noEmit && vp build` (TS 7 `tsc`), then re-run until it fails. Delete the `__probe` line and confirm `pnpm build` passes again.

- [ ] **Step 8: Configure `fmt` in `vite.config.ts`**

Values:
- `printWidth: 120`, `tabWidth: 2`, `useTabs: false`, `semi: true`, `singleQuote: true`, `jsxSingleQuote: false`, `trailingComma: 'all'`, `arrowParens: 'always'`, `endOfLine: 'lf'`
- `sortPackageJson: false`
- `ignorePatterns`: `dist/**`, `node_modules/**`, `public/**`, plus patterns excluding every non-JS/TS file the formatter would otherwise touch (`**/*.{css,scss,md,mdx,html,json,jsonc,yaml,yml}` at minimum)
- `sortTailwindcss: { stylesheet: './src/index.css' }`. No `functions`, since the old prettier config did not sort inside `cn()`/`cva()`.
- `sortImports` reproducing the old `importOrder` (`^react$`, third-party, `^@/components/(.*)$`, `^@/(.*)$`, relative), with a blank line between groups and sorted specifiers:
  - `customGroups`: `{ groupName: 'react', elementNamePattern: ['react'] }`, `{ groupName: 'components', elementNamePattern: ['@/components/**'] }`
  - `groups`: `['react', ['builtin', 'external'], 'components', 'internal', ['parent', 'sibling', 'index', 'style', 'side_effect'], 'unknown']`
  - `newlinesBetween: true`, `internalPattern: ['@/']`

- [ ] **Step 9: Run the zero-diff test**

Run: `pnpm format && git diff --stat -- src`
Expected: the only `src/` changes are deliberate migrator rewrites (e.g. a `vite-plus` client type reference), with **no** formatting changes. If formatting changes appear, adjust `sortImports`/`sortTailwindcss` options until they disappear. If a difference cannot be expressed in oxfmt (e.g. specifier sorting inside braces, or position of side-effect CSS imports), keep the oxfmt output for that case and list each one in the commit body.

- [ ] **Step 10: Verify the scope exclusion**

Run: `pnpm format && git status --short README.md index.html src/index.css docs components.json`
Expected: no changes.

- [ ] **Step 11: Verify dev still works**

Run `pnpm dev` and load `/`, then run `pnpm start` after a build.
Expected: both serve the app.

- [ ] **Step 12: Commit**

```bash
git add package.json pnpm-lock.yaml vite.config.ts tsconfig.json src eslint.config.js .prettierrc .prettierignore .husky
git commit -m "chore: migrate tooling to vite+ and typescript 7"
```

Also add `.vite-hooks/` if it exists and any other file the migrator created that belongs to the toolchain. Re-check `git status --short` before committing. `CLAUDE.md`, `AGENTS.md` and `.gitignore` must still show as unstaged.

---

### Task 5: Map the ESLint rules onto oxlint

**Files:**
- Modify: `vite.config.ts` (`lint` block)
- Modify: `src/components/theme-provider.tsx:40`, `src/routes/app-route.tsx:37`, `src/hooks/use-query-params.ts:1`, `src/utils/storage.ts:13` (disable comments)

**Interfaces:**
- Consumes: `lint` block and `lint`/`lint:fix` scripts from Task 4.

- [ ] **Step 1: Write the failing rule probes**

Create the throwaway file `src/__lint-probe.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Probe({ items, dep }: { items: string[]; dep: number }) {
  const _ignored = 1;
  const [v] = useState(0);
  if (dep) {
    // rules-of-hooks violation
    useState(1);
  }
  useEffect(() => {
    console.log(dep);
  }, []);
  try {
    JSON.parse('');
  } catch {}
  const x: any = v;

  return <>{items.map((i) => <span>{i}{x}</span>)}</>;
}
```
Run: `pnpm lint`
Expected now: not all of the outcomes below are reported yet.

- [ ] **Step 2: Configure `lint` rules in `vite.config.ts`**

Keep `options: { typeAware: true, typeCheck: true }`. Enable the plugins `eslint`, `typescript`, `react`, `oxc`. Use `ignorePatterns`: `dist/**`, `node_modules/**`, `public/**`, `build/**`, `src/assets/**`, `**/*.md`. Rules, mapped from `eslint.config.js` (use oxlint's names; drop any option oxlint rejects):

| Rule | Setting |
|---|---|
| `no-console` | `error` |
| `no-unused-vars` | `['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }]` |
| `typescript/no-explicit-any` | `warn` |
| `no-use-before-define` | `error` |
| `no-duplicate-imports` | `warn` |
| `react/jsx-key` | `['error', { checkFragmentShorthand: true, checkKeyMustBeforeSpread: true, warnOnDuplicates: true }]` |
| `react/rules-of-hooks` | `error` |
| `react/exhaustive-deps` | `warn` |
| `no-empty` | `['error', { allowEmptyCatch: true }]` |
| `react/react-in-jsx-scope`, `react/only-export-components`, `eqeqeq` | `off` |

Dropped (no oxlint equivalent, or a no-op): `newline-before-return`, `no-multiple-empty-lines`, `no-restricted-imports`, `space-before-function-paren`, `strict-boolean-expressions`, `no-empty-interface`. If a rule in the table turns out not to exist in the bundled oxlint, drop it and note it in the commit body.

If a default-on oxlint or type-aware rule that was **not** in the old config reports an **error** on existing app code, turn that rule off in config rather than changing app code. Note each one in the commit body.

- [ ] **Step 3: Run the probes**

Run: `pnpm lint`
Expected on `src/__lint-probe.tsx`:
- `no-console` error
- `rules-of-hooks` error
- `exhaustive-deps` warning
- `no-explicit-any` warning
- `jsx-key` error
- **no** oxlint `no-unused-vars` report for `_ignored`, and **no** report for the empty `catch {}`
- TypeScript `noUnusedLocals` errors from the type check are expected here and do not matter

Then run `pnpm lint:fix` and confirm the unused `cn` import is removed (unused-import autofix). If oxlint only offers this as a "dangerous" fix, enable the setting that applies it with `--fix`. Unused imports must be auto-removed on commit.

- [ ] **Step 4: Delete the probe file**

- [ ] **Step 5: Convert the disable comments**

Rewrite the four existing `eslint-disable` comments to the rule names oxlint uses (`react/exhaustive-deps`, `typescript/no-explicit-any`), either as `oxlint-disable…` or as `eslint-disable…` if oxlint honors it with the new names.
Run: `pnpm lint`
Expected: no `exhaustive-deps` / `no-explicit-any` report at those four locations, no "unused disable directive" report, exit code 0.

- [ ] **Step 6: Verify the whole check**

Run: `pnpm check && pnpm build`
Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts src/components/theme-provider.tsx src/routes/app-route.tsx src/hooks/use-query-params.ts src/utils/storage.ts
git commit -m "chore: port eslint rules to oxlint"
```

---

### Task 6: Pre-commit hook via Vite+ (staged checks + project type check)

**Files:**
- Modify: `vite.config.ts` (`staged` block), `package.json` (`prepare`)
- Create/Modify: `.vite-hooks/pre-commit`

**Interfaces:**
- Consumes: `prepare`, `lint:fix` and `format` behavior from Tasks 4–5.

- [ ] **Step 1: Set the `staged` block**

Map `'*.{js,jsx,ts,tsx}'` to the commands that lint-fix and format staged files: `vp check --fix`, or `vp lint --fix` + `vp fmt` if `check --fix` also type-checks per file and is slow.

- [ ] **Step 2: Set `.vite-hooks/pre-commit`**

Two lines: `vp staged`, then a whole-project type check (`vp check --no-fmt --no-lint`, or the `tsc --noEmit` fallback chosen in Task 4).

Steps 3–6 run in a throwaway clone (scratch directory, called `$CLONE` below), so probe commits never touch this repo's history.

- [ ] **Step 3: Fresh-clone hook probe (Review Focus 1)**

Run:
```bash
rm -rf "$CLONE" && git clone . "$CLONE"
mkdir -p "$CLONE/.vite-hooks" && cp .vite-hooks/pre-commit "$CLONE/.vite-hooks/"
cp vite.config.ts package.json "$CLONE/"
cd "$CLONE" && pnpm install && pnpm exec vp hooks status && git config --get core.hooksPath
```
Expected: hooks reported active and `core.hooksPath` points into `.vite-hooks`, with no manual step after `pnpm install`. Commit the copied files in the clone (`git add -A && git commit -m wip`) so later probes start from a clean tree; that commit itself runs the hook.

- [ ] **Step 4: Staged-fix probe**

In `$CLONE`, change one import in `src/pages/not-found.tsx` to double quotes and add the unused import `import { cn } from '@/lib/utils';`. Then run `git add src/pages/not-found.tsx && git commit -m "test: probe"`.
Expected: either the commit succeeds with `git show --stat HEAD` showing no change to `not-found.tsx` (quotes restored, unused import removed), or the hook aborts because nothing is left to commit. In both cases the working file is back to its original content.

- [ ] **Step 5: Type-error commit probe (Review Focus 5)**

In `$CLONE`, append `export const __probe: number = 'x';` to `src/lib/utils.ts` **without staging it**. Add a new line `// probe` at the end of `src/pages/not-found.tsx`, stage only that file, and run `git commit -m "test: probe"`.
Expected: the commit is **rejected** with the type error from `src/lib/utils.ts`.

- [ ] **Step 6: Timing check**

In `$CLONE`, revert `src/lib/utils.ts`, keep the staged `not-found.tsx` edit, and run `time sh .vite-hooks/pre-commit`.
Expected: a few seconds at most. If it is slow, use the lighter `staged` command from Step 1. Delete `$CLONE` afterwards.

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts package.json .vite-hooks/pre-commit
git commit -m "chore: run staged checks and type check on commit via vite+"
```

The commit itself must pass through the new hook.

---

### Task 7: README and fresh-clone verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

- Features: replace "ESLint + Prettier" and "Husky + lint-staged" with Vite+ (Oxlint, Oxfmt, type check via TS 7, staged-file checks on commit).
- Technologies Used: React 19, TypeScript 7, Vite 8 (Vite+), Tailwind CSS 4, React Router 8, zod 4, Node 24, pnpm 12. Remove ESLint/Prettier/Husky/lint-staged.
- Project Structure: remove `.husky/`, `.prettierrc`, `eslint.config.js`, `.npmrc` and the `yarn.lock / package-lock.json` rows. Add `.vite-hooks/` and `pnpm-lock.yaml`. Fix "React Router (version 7.x)" → 8.x.
- Node version section: Node 24.
- Scripts: list `dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `check`.

- [ ] **Step 2: Grep for stale references**

Run: `grep -rniE "eslint|prettier|husky|lint-staged|yarn\.lock|package-lock|node 22|22\.x|typescript.{0,3}5|vite.{0,3}6|react-router-dom" README.md package.json vite.config.ts tsconfig.json src .vite-hooks`
Expected: no matches, except `eslint-disable` comments if Task 5 kept that form.

- [ ] **Step 3: Fresh-clone end-to-end (spec success criteria)**

Run:
```bash
rm -rf "$CLONE" && git clone . "$CLONE" && cd "$CLONE"
cp .env.example .env
pnpm install && pnpm check && pnpm build && pnpm exec vp hooks status
```
Expected: all exit 0, with no peer-dependency errors during install. Delete `$CLONE` afterwards.

- [ ] **Step 4: Final browser smoke**

Repeat Task 2 Step 7 on `pnpm dev`.
Expected: identical behavior.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update readme for new toolchain"
```

Then run `git status --short` and confirm that only the pre-existing `CLAUDE.md`, `AGENTS.md` and `.gitignore` changes remain unstaged.
