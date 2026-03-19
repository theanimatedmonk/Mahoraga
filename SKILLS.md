# Mahoraga — Skill Inventory

Current capabilities organized by category. Update this file whenever a new skill is added.

## Design System / Tokens

| Command | Description |
|---------|-------------|
| `tokens preset shadcn` | shadcn color system (276+ variables, Light/Dark mode) |
| `tokens preset radix` | Radix UI color system (156 variables) |
| `tokens tailwind` | Full Tailwind CSS color palette (22 families, 50-950 shades) |
| `tokens spacing` | Spacing scale (4px base) |
| `tokens radii` | Border radius scale |
| `tokens import <file>` | Import tokens from JSON file |
| `shadcn add --all` | 30 shadcn/ui components (58 variants) with real Lucide icons |
| `shadcn add <names>` | Add specific shadcn components |
| `shadcn list` | List available shadcn components |

## Create Elements

| Command | Description |
|---------|-------------|
| `create frame <name>` | Create a frame |
| `create rect [name]` | Create a rectangle |
| `create ellipse [name]` | Create an ellipse/circle |
| `create text <content>` | Create a text layer |
| `create line` | Create a line |
| `create icon <name>` | Insert icon from Iconify (150k+ icons) |
| `create image <url>` | Import image from URL |
| `create component [name]` | Convert selection to component |
| `create group [name]` | Group current selection |
| `create autolayout [name]` | Create auto-layout frame |

## JSX Rendering

| Command | Description |
|---------|-------------|
| `render '<jsx>'` | Render complex layouts with JSX-like syntax |
| `render-batch` | Render multiple JSX frames in a single call |

Supports `<Frame>`, `<Text>`, `<Icon>`, `<Slot>` with auto-layout props (`flex`, `gap`, `p`, `justify`, `items`, `grow`, `wrap`, `w`, `h`, `bg`, `rounded`, etc.)

## Variables & Binding

| Command | Description |
|---------|-------------|
| `var create <name>` | Create a variable |
| `var list` | List all variables |
| `var find <pattern>` | Find variables by name pattern |
| `var create-batch <json>` | Create multiple variables at once |
| `var delete-all` | Delete all local variables and collections |
| `collections create <name>` | Create a variable collection |
| `collections list` | List all collections |
| `bind fill <varName>` | Bind color variable to fill |
| `bind stroke <varName>` | Bind color variable to stroke |
| `bind radius <varName>` | Bind number variable to corner radius |
| `bind gap <varName>` | Bind number variable to auto-layout gap |
| `bind padding <varName>` | Bind number variable to padding |

## Modify & Layout

| Command | Description |
|---------|-------------|
| `set fill <color>` | Set fill color |
| `set stroke <color>` | Set stroke color |
| `set radius <value>` | Set corner radius |
| `set size <w> <h>` | Set size |
| `set pos <x> <y>` | Set position |
| `set opacity <value>` | Set opacity |
| `set name <name>` | Rename node |
| `set autolayout <dir>` | Apply auto-layout |
| `sizing hug/fill/fixed` | Set sizing mode |
| `sizing padding <value>` | Set padding |
| `sizing gap <value>` | Set auto-layout gap |
| `sizing align <alignment>` | Align items |
| `arrange` | Arrange frames on canvas |

## Analysis & Linting

| Command | Description |
|---------|-------------|
| `analyze colors` | Analyze color usage |
| `analyze typography` | Analyze typography |
| `analyze spacing` | Analyze spacing usage |
| `analyze clusters` | Find repeated patterns (potential components) |
| `lint` | Run 8+ design rules |
| `analyze a11y contrast` | Check WCAG contrast ratios |
| `analyze a11y vision` | Simulate color blindness |
| `analyze a11y touch` | Check touch target sizes |
| `analyze a11y text` | Check text accessibility |
| `analyze a11y focus` | Show reading/focus order |
| `analyze a11y audit` | Full accessibility audit |

## Export

| Command | Description |
|---------|-------------|
| `export screenshot` | Take a screenshot (png, jpg, svg, pdf) |
| `export node <nodeId>` | Export a node by ID |
| `export css` | Export variables as CSS custom properties |
| `export tailwind` | Export color variables as Tailwind config |
| `node export-jsx` | Export node as JSX/React code |
| `node export-storybook` | Export components as Storybook stories |

## Node Operations

| Command | Description |
|---------|-------------|
| `get [nodeId]` | Get properties of node or selection |
| `find <name>` | Find nodes by name |
| `node tree [nodeId]` | Show node tree structure |
| `node bindings [nodeId]` | Show variable bindings |
| `node to-component <ids>` | Convert frames to components |
| `node delete <ids>` | Delete nodes by ID |
| `node select <nodeId>` | Select a node |
| `node duplicate [nodeId]` | Duplicate a node |

## Direct Code Execution

| Command | Description |
|---------|-------------|
| `eval '<code>'` | Run any Figma Plugin API code directly |
| `run <file>` | Run a JavaScript file in Figma |

## Drop — Component Drop-in

| Command | Description |
|---------|-------------|
| `drop list` | List all available drops |
| `drop list -c <category>` | Filter by category |
| `drop categories` | List drop categories |
| `drop in <name>` | Drop a component onto the canvas |
| `drop save <name>` | Save selected Figma element as a reusable drop |
| `drop save <name> -c <cat>` | Save with a category |
| `drop save <name> -a <aliases>` | Save with comma-separated aliases |
| `drop remove <name>` | Remove a saved drop |

Built-in drops:

| Drop ID | Category | Description |
|---------|----------|-------------|
| `android-bottom-sheet` | android | Material Design 3 bottom sheet |
| `android-fab` | android | Floating action button |
| `android-top-app-bar` | android | Top app bar with title and actions |

Aliases work: `drop in bottom-sheet`, `drop in fab`, `drop in toolbar`

Registry:
- `src/drops/index.js` — built-in template drops
- `src/drops/saved.json` — user-saved drops (auto-loaded)
- `src/drops/serializer.js` — node serializer + code generator

Three types:
- `template` — creates from code (self-contained)
- `saved` — captured from Figma selection, stored as JSON, code generated at runtime
- `library` — imports from a published Figma team library by component key

## Pre-built Blocks

| Command | Description |
|---------|-------------|
| `blocks list` | List available blocks |
| `blocks create <id>` | Create a block in Figma |

Available: `dashboard-01`

## Slots (Component Content Areas)

| Command | Description |
|---------|-------------|
| `slot create <name>` | Create a slot on selected component |
| `slot list [nodeId]` | List slots in a component |
| `slot preferred <key> <ids>` | Set preferred components for a slot |
| `slot reset [nodeId]` | Reset slot to defaults |
| `slot convert [nodeId]` | Convert frame to slot |
| `slot add <nodeId>` | Add content to a slot |

## Component Variants

| Command | Description |
|---------|-------------|
| `sizes [nodeId]` | Generate S/M/L size variants |
| `combos [nodeId]` | Generate all variant combinations in a grid |

## FigJam

| Command | Description |
|---------|-------------|
| `figjam sticky <text>` | Create a sticky note |
| `figjam shape <text>` | Create a shape with text |
| `figjam text <content>` | Create a text node |
| `figjam connect <start> <end>` | Create a connector |
| `figjam eval <code>` | Execute JavaScript in FigJam context |

## Connection & Management

| Command | Description |
|---------|-------------|
| `connect` | Connect to Figma (Yolo Mode) |
| `connect --safe` | Connect to Figma (Safe Mode, plugin) |
| `mahoraga status` | Check if Mahoraga is running |
| `mahoraga restart` | Restart with fresh token |
| `mahoraga diagnose` | Diagnose connection issues |
| `files` | List open Figma design files |
| `diagnose` | Check system compatibility |

---

## Adding a New Skill

1. **Create module** — `src/<skill-name>.js` with component/token definitions
2. **Register commands** — Add Commander group in `src/index.js`
3. **Document for AI** — Update `CLAUDE.md`, `.cursor/rules/figma-cli.mdc`, `REFERENCE.md`
4. **Update this file** — Add the new skill's commands to the appropriate section above
5. **(Optional) Add blocks** — Pre-composed layouts in `src/blocks/`
