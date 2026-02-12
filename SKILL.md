---
name: babyconnect-browser
description: Log baby activities (bottles, nursing, diapers, sleep, weight) to Baby Connect via browser automation. For Quinn and Logan Kessler. Use when asked to "log a diaper", "record feeding", "track bottle", "baby ate", "Quinn had a poopy diaper", "log nursing", "baby is sleeping", "record nap", "diaper change", "fed the baby", "log weight", "record weight".
metadata: {"moltbot": {"emoji": "👶", "requires": {"tools": ["browser", "exec"]}}}
---

# Baby Connect Browser Skill

Automate baby tracking on babyconnect.com using the `browser` tool.

## When to Use

Trigger this skill when asked to:
- Log a diaper change
- Record a bottle feeding
- Track nursing session
- Record sleep/nap
- Log weight measurement
- Check recent activity

## Children

| Name | Child ID | Notes |
|------|----------|-------|
| Quinn Erika Kessler | `4744184165629952` | Newborn (Jan 2026) |
| Logan Sophia Kessler | `5765432109876543` | Big sister (Sep 2020) |

**Default child:** Quinn (unless explicitly asked about Logan)

## Authentication

Credentials stored in 1Password:
- **Vault:** `Clawd`
- **Item:** `Baby Connect`
- **Fields:** `username`, `password`

Retrieve password:
```bash
op read "op://Clawd/Baby Connect/password"
```

## Method Selection Guide

| Activity | Method | Why |
|----------|--------|-----|
| **Diaper** | Native `act` clicks | Type/size selection needs React event system |
| **Bottle** | `evaluate` snippet (set `_uinfo.DUnit` BEFORE dialog) | Unit must be set before dialog creation |
| **Weight** | `evaluate` snippet (select child tab first) | Child tab must be selected or dialog crashes |
| **Nursing** | `evaluate` snippet | Input fields work with JS value setting |
| **Sleep** | `evaluate` snippet | Input fields work with JS value setting |
| **Edit/Delete** | Mixed | Find with evaluate, confirm with `act` |

## Quick Reference

**For detailed procedures:**
- `references/browser-automation.md` - Complete step-by-step automation procedures for all activities

**Key rules:**
1. Set `_uinfo.DUnit = 1` (ml) BEFORE opening bottle dialog
2. Use native `act` clicks for React UI elements (child selection, diaper type)
3. Always verify summary text before clicking Save
4. Use `evaluate` with native setter for text inputs
5. Take fresh snapshot before each action (refs change)

## Common Operations

### Log Diaper (Step-by-Step)
1. Take snapshot, click "Diaper" link
2. Wait 1.5s for dialog
3. Take snapshot of dialog
4. Use native `act` to click child
5. Use native `act` to click diaper type (BM/Wet/BM+Wet/Dry)
6. Use native `act` to select size
7. Verify summary text in snapshot
8. Click Save with native `act`

See `references/browser-automation.md` for complete code examples.

### Log Bottle (Quick Method)
1. Set `_uinfo.DUnit = 1` BEFORE opening dialog
2. Click "Bottle" link
3. Use evaluate snippet to fill form (see references)
4. Verify summary shows correct value AND unit
5. Click Save

### Log Nursing/Sleep
Use evaluate snippets with:
- Child selection first (form activation)
- Native value setter for inputs
- Full event sequence (focus → set → input → change → blur)
- Summary verification before save

See `references/browser-automation.md` for complete code.

## Critical Rules

**React SPA Automation:**
- Always activate form first (select child)
- Use native `act` clicks for UI elements
- Use native setter for text inputs
- Full event sequence for React to recognize changes

**Defensive Verification:**
- Always verify summary text before saving
- Check both value AND unit (for bottles)
- Take snapshot to confirm before clicking Save

**Unit Handling (Bottles):**
- Set `_uinfo.DUnit` BEFORE opening dialog (1=ml, 0=oz)
- Dialog reads unit at creation time
- Cannot toggle after dialog is open

## Reference Documentation

**`references/browser-automation.md`** - Complete automation reference:
- React SPA rules and event handling
- Defensive verification patterns
- Step-by-step procedures for all activities (bottle, diaper, nursing, sleep)
- Utility commands (check recent, edit, delete)
- Troubleshooting guide
- Key learnings and gotchas
