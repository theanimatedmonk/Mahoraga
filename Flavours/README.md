# Launcher flavours — knowledge base

Each subfolder is one **flavour** (minus-one utility app on top of the base Android launcher).

## Structure per flavour

```
<Flavour name>/
├── README.md
├── Screenshots/          # PNG per screen + manifest.json
└── design system/
    └── tokens/           # colors, typography, CSS variables
```

## Add a new flavour

1. In Figma, select the **SECTION** for that app.
2. In Cursor, ask: **"Create knowledge base for this flavour"** (uses skill `create-knowledge-base`).
3. Or run from repo root:

```bash
node src/index.js connect --safe
node scripts/export-flavour-knowledge-base.mjs --name "Your App Name"
```

## Current flavours

| Folder | Description |
|--------|-------------|
| [Breaking News app](./Breaking%20News%20app/) | Breaking News Launcher minus-one screens + `SKILL.md` for LLM handoff |
