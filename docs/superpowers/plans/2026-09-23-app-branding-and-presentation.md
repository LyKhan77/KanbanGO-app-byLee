# App Branding & Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save the generated presentation images and markdown to the `temp/` folder, and integrate the official `KanbanGO!.png` brand icon across Electron packaging, window header, system tray, and documentation.

**Architecture:** Utilize `resources/icon.png` (512x512) as the single source of truth for `electron-builder` (buildResources), Main Process `BrowserWindow`, and System `Tray`. Embed the brand icon inside `src/renderer/src/assets/icon.png` for the React `WindowHeader` and `index.html` favicon.

**Tech Stack:** Electron 31, React 18, TypeScript, Tailwind CSS, electron-builder, Vitest.

---

### Task 1: Copy Presentation Assets to `temp/` Folder

**Files:**
- Create/Copy: `temp/1_board_showcase.jpg`
- Create/Copy: `temp/2_calendar_view.jpg`
- Create/Copy: `temp/3_card_detail_modal.jpg`
- Create/Copy: `temp/4_updater_showcase.jpg`
- Create/Copy: `temp/presentation_kanbango.md`

- [ ] **Step 1: Verify `temp/` directory and copy the 4 screenshots and markdown**
  Copy files from the artifact directory `C:\Users\Lee\.gemini\antigravity-cli\brain\d2ebbc82-81f2-4a7f-8967-131b758238b2` to `temp/`.

- [ ] **Step 2: Verify `temp/` is excluded from git**
  Check `git status` to ensure `temp/` files are ignored by `.gitignore`.

---

### Task 2: Configure Electron-Builder & Resources Directory for Official Icon

**Files:**
- Create: `resources/icon.png`
- Modify: `package.json`

- [ ] **Step 1: Copy `KanbanGO!.png` to `resources/icon.png`**
  Ensure the 512x512 PNG is placed in `resources/icon.png`.

- [ ] **Step 2: Update `package.json` build configuration**
  Add `"buildResources": "resources"` in `"directories"`, set `"icon": "resources/icon.png"` in `"build"`, `"win"`, `"mac"`, `"linux"`, and include `"resources/**/*"` in `"files"`.

- [ ] **Step 3: Verify `.gitignore`**
  Confirm `resources/` is tracked and not ignored.

---

### Task 3: Integrate Icon in Main Process & System Tray

**Files:**
- Modify: `src/main/index.ts`
- Modify: `src/main/tray.ts`
- Test: `tests/main/tray.test.ts` (if tray tests exist) or run Vitest suite

- [ ] **Step 1: Set window icon in `src/main/index.ts`**
  In `createWindow()`, pass `icon: join(__dirname, '../../resources/icon.png')`.

- [ ] **Step 2: Update `setupSystemTray` in `src/main/tray.ts`**
  Load `resources/icon.png` via `nativeImage.createFromPath`, resize to 16x16 / 32x32, and fall back to `FALLBACK_ICON_PNG` gracefully if file not found (e.g. during headless unit testing).

- [ ] **Step 3: Run existing unit tests**
  Execute `npx vitest run` to ensure tray and main process tests pass.

---

### Task 4: Integrate Brand Logo in Renderer WindowHeader and Favicon

**Files:**
- Create: `src/renderer/src/assets/icon.png`
- Modify: `src/renderer/src/components/layout/WindowHeader.tsx`
- Modify: `src/renderer/index.html`

- [ ] **Step 1: Copy `KanbanGO!.png` to `src/renderer/src/assets/icon.png`**
  Create directory `src/renderer/src/assets` and copy the icon.

- [ ] **Step 2: Update `WindowHeader.tsx`**
  Import `brandIcon from '../../assets/icon.png'` and replace the generic feather placeholder with the official leaf/feather branding image.

- [ ] **Step 3: Add favicon link in `src/renderer/index.html`**
  Add `<link rel="icon" type="image/png" href="./src/assets/icon.png" />`.

- [ ] **Step 4: Run renderer tests**
  Execute `npx vitest run tests/components/WindowHeader.test.tsx` to ensure tests continue to pass.

---

### Task 5: Full Build Verification, Documentation Update & Commit

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `ARCHITECTURE.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Run complete test suite and production build**
  Execute `npm test` and `npm run build`.

- [ ] **Step 2: Update core documentation**
  Document the branding icon, asset paths, and visual identity in `README.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, and `AGENTS.md`.

- [ ] **Step 3: Commit and push changes**
  Commit all changes with clear descriptive messages without any AI attribution.
