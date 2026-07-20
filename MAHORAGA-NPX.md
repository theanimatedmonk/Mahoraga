# Mahoraga — `npx` command reference

Use this after installing the CLI in any project:

```bash
npm i -D @deanimatedmonk/mahoraga
```

All commands use the **`mahoraga`** binary. From the project root you can run:

```bash
npx mahoraga <command> [options]
```

**Requirements:** Figma **Desktop** open with your file, and a **session connection** (`connect`). The CLI talks to Figma via CDP and/or the Mahoraga bridge — not your React dev server.

**Config on disk:** `~/.mahoraga/` (token, config). Legacy `~/.figma-ds-cli/` is migrated on read.

---

## Connection & bridge

| Action | Command |
|--------|---------|
| First-time / interactive setup | `npx mahoraga init` |
| Connect (Yolo — patches Figma for CDP) | `npx mahoraga connect` |
| Connect **Safe** (plugin bridge, no patch) | `npx mahoraga connect --safe` |
| Connection status | `npx mahoraga status` |
| Remove patch | `npx mahoraga unpatch` |
| Bridge: status / restart / diagnose | `npx mahoraga bridge status` |
| | `npx mahoraga bridge restart` |
| | `npx mahoraga bridge diagnose` |
| | `npx mahoraga bridge start` \| `stop` \| `reconnect` |

Safe mode: run your **FigIDE** (or bundled) plugin from **Plugins → Development** and keep it open while using the bridge.

---

## Variables & collections

| Action | Command |
|--------|---------|
| List all variables | `npx mahoraga var list` |
| Find by pattern | `npx mahoraga var find "primary/*"` |
| Visualize colors on canvas | `npx mahoraga var visualize` |
| | `npx mahoraga var visualize "collection-name"` |
| Create variable | `npx mahoraga var create "<name>"` (see `--help`) |
| Create many from JSON | `npx mahoraga var create-batch '<json>'` |
| Delete all (careful) | `npx mahoraga var delete-all` |
| | `npx mahoraga var delete-all -c "collectionName"` |
| Delete batch by node IDs | `npx mahoraga var delete-batch "id1,id2"` |
| Bind batch | `npx mahoraga var bind-batch '<json>'` |
| Set batch | `npx mahoraga var set-batch '<json>'` |
| Rename batch | `npx mahoraga var rename-batch '<json>'` |
| List collections | `npx mahoraga col list` |
| Create collection | `npx mahoraga col create "Name"` |

---

## Token presets (create variables)

| Action | Command |
|--------|---------|
| shadcn preset (primitives + semantic, light/dark) | `npx mahoraga tokens preset shadcn` |
| Tailwind palette | `npx mahoraga tokens tailwind` |
| Spacing tokens | `npx mahoraga tokens spacing` |
| Radii tokens | `npx mahoraga tokens radii` |
| IDS / DS base | `npx mahoraga tokens ds` |
| Import tokens file | `npx mahoraga tokens import <file>` |
| shadcn **components** (UI kit) | `npx mahoraga shadcn list` |
| | `npx mahoraga shadcn add button card …` |
| | `npx mahoraga shadcn add --all` |

---

## Export (files, codegen, CSS)

| Action | Command |
|--------|---------|
| **Selection → JSON** (for Cursor / React codegen) | `npx mahoraga export selection -o figma-selection.json` |
| Skip variable-binding metadata | `npx mahoraga export selection -o out.json --no-bindings` |
| Screenshot selection or page | `npx mahoraga export screenshot -o shot.png` |
| Export node by ID | `npx mahoraga export node "1:234" -o out.png` |
| Variables → CSS | `npx mahoraga export css` |
| Variables → Tailwind config snippet | `npx mahoraga export tailwind` |

---

## Query canvas & nodes

| Action | Command |
|--------|---------|
| Canvas overview | `npx mahoraga canvas info` |
| Next placement hint | `npx mahoraga canvas next` |
| Find by name | `npx mahoraga find "Button"` |
| Get node | `npx mahoraga get "1:234"` |
| Select node | `npx mahoraga select "1:234"` |
| List open Figma files (JSON) | `npx mahoraga files` |

---

## Create primitives & JSX

| Action | Command |
|--------|---------|
| Rectangle | `npx mahoraga create rect "Name" -w 320 -h 200 --fill "#fff"` |
| Ellipse / circle | `npx mahoraga create ellipse "Avatar"` \| `create circle …` |
| Text | `npx mahoraga create text "Hello" -s 16` |
| Line | `npx mahoraga create line` |
| Frame / autolayout | `npx mahoraga create autolayout "Card" -d col -g 16` |
| Icon (Lucide) | `npx mahoraga create icon lucide:star -s 24` |
| Image from URL | `npx mahoraga create image <url>` |
| **JSX render** | `npx mahoraga render '<Frame …>…</Frame>'` |
| Batch render | `npx mahoraga render-batch` (see `--help`) |

Use `var:name` for token binding, e.g. `--fill "var:primary"`, `bg="var:card"` in `render`.

---

## Modify selection / node

| Action | Command |
|--------|---------|
| Set fill / stroke / radius | `npx mahoraga set fill "#3b82f6"` \| `set stroke …` \| `set radius 12` |
| Bind to variable | `npx mahoraga set fill "var:primary"` |
| Delete / duplicate | `npx mahoraga delete` \| `npx mahoraga duplicate` |
| Node subtree / bindings | `npx mahoraga node tree "1:234"` (see `npx mahoraga node --help`) |
| **Turn frame into component** | `npx mahoraga node to-component "1:234"` |

---

## Blocks, drops, layout helpers

| Action | Command |
|--------|---------|
| List / create blocks | `npx mahoraga blocks list` |
| | `npx mahoraga blocks create dashboard-01` |
| List drops | `npx mahoraga drop list` |
| | `npx mahoraga drop list -c android` |
| Drop on canvas | `npx mahoraga drop in <name>` |
| Save selection as drop | `npx mahoraga drop save "My Name"` |
| Variant combos | `npx mahoraga combos` \| `npx mahoraga combos "1:234"` |
| Size variants | `npx mahoraga sizes` (see `--help`) |

---

## Slots (components)

| Action | Command |
|--------|---------|
| Create slot on selection | `npx mahoraga slot create "Content"` |
| List / preferred / reset / convert / add | `npx mahoraga slot list` … (see `npx mahoraga slot --help`) |

---

## Web → Figma (optional)

| Action | Command |
|--------|---------|
| Screenshot URL | `npx mahoraga screenshot <url>` |
| Analyze URL | `npx mahoraga analyze-url <url>` |
| Recreate in Figma | `npx mahoraga recreate-url <url>` |
| Remove background (selection) | `npx mahoraga remove-bg` |

---

## Plugin API & automation

| Action | Command |
|--------|---------|
| Run JS in Figma | `npx mahoraga eval "figma.currentPage.name"` |
| From file | `npx mahoraga eval --file ./script.js` |
| Alias | `npx mahoraga run ./script.js` |
| Low-level `figma-use` passthrough | `npx mahoraga raw …` (see `--help`) |

---

## Quality & assets

| Action | Command |
|--------|---------|
| Screenshot selection for review | `npx mahoraga verify` |
| | `npx mahoraga verify "1:234"` |
| Accessibility lint | `npx mahoraga lint` |
| Render pipeline diagnose | `npx mahoraga render diagnose` |

---

## FigJam

| Action | Command |
|--------|---------|
| FigJam commands | `npx mahoraga figjam --help` |
| Short alias | `npx mahoraga fj --help` |

---

## Making the **Cursor agent** see Figma data

The AI only reads **files in the repo** and **command output you save**. After connecting:

```bash
npx mahoraga var list > figma-variables.txt
npx mahoraga export selection -o figma-selection.json
```

Then ask the agent to use those files for codegen or documentation.

---

## Help

```bash
npx mahoraga --help
npx mahoraga <command> --help
```

For deeper detail, see **`REFERENCE.md`** in the [mahoraga repository](https://github.com/silships/figma-cli).
