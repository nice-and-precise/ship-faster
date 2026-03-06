# Ship Faster (Nice-and-Precise Fork)

A practical AI product-engineering toolkit for shipping faster with repeatable workflows.

> **Canonical repo for this team:** https://github.com/nice-and-precise/ship-faster

---

## What this is

Ship Faster is a repo of:
- **Skills** (workflow/tool/review/service packs)
- **Templates** (runnable reference projects)
- **Pixel Office Kit** (Nintendo-style operations UI)
- **Docs + run artifacts** for reliable, auditable AI-assisted delivery

This fork is now maintained as **our product baseline**.

---

## What changed in this fork

Recent integration wave included:
- Mission Control telemetry mapping + reliability + dispatch foundations
- Nintendo-authentic Pixel Office UI upgrades
- Mission Brief overlay wired to real telemetry state (no fake status)
- Verification-gated workflow artifacts in `mission-control/artifacts/`
- Paperclip sidecar engine + Mission Control ingest lane for approval-first operations

---

## Quick Start

### 1) Clone our fork

```bash
git clone https://github.com/nice-and-precise/ship-faster.git
cd ship-faster
```

### 2) Use skills with your agent

```bash
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

### 3) Run Pixel Office kit

```bash
cd pixel-office-kit
npm install
npm run test:telemetry
npm run build
npm run dev
```

---

## Repo map

- `skills/` — composable skill packages
- `templates/` — runnable app templates
- `pixel-office-kit/` — retro operations UI + telemetry shell
- `mission-control/artifacts/` — checkpoint, handoff, and gate evidence
- `docs/` — supporting documentation (see [INDEX.md](docs/INDEX.md))

---

## Verification gates (current standard)

### Mission Control (backend)

```bash
cd mission-control
./.venv/bin/pytest -q
make check-routes
PORT=18080 make smoke-ingest
```

### Pixel Office (frontend)

```bash
cd pixel-office-kit
npm run test:telemetry
npm run build
```

Expected: all commands pass with no failed tests and successful build.

---

## Git remotes policy

For local clones of this fork:
- `origin` = `https://github.com/nice-and-precise/ship-faster.git` (write target)
- `upstream` = source/open-source reference (read-only sync target)

We build on our fork and do not require upstream contribution.

---

## Notes

- Root repo is a toolkit workspace; run specific templates/components from their own directories.
- Keep commits path-scoped and avoid broad `git add .` in multi-project trees.
- Preserve proof-gated workflow: claim -> proof -> pass/fail -> next.

---

## Attribution

This project started from an open-source base and is actively evolved in this fork for our production workflow.
