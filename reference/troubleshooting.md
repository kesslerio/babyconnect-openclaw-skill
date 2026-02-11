# Baby Connect Troubleshooting

## Contents
1. [Unit Toggle Issues (FIXED 2026-02-10)](#unit-toggle-issues)
2. [Weight Dialog Issues (FIXED 2026-02-10)](#weight-dialog-issues)
3. [Common Errors](#common-errors)
4. [Session Issues](#session-issues)
5. [Error Codes](#error-codes)

---

## Unit Toggle Issues

**Problem:** Entry shows oz when you wanted ml (or vice versa)

**Root Cause (2026-02-10):** `_uinfo.DUnit` controls everything — dropdown values, unit label, AND save parameter. BUT the bottle dialog reads it ONLY at creation time (`showBibDlg()`). Setting it after dialog opens does nothing.

**Solution:** Set `_uinfo.DUnit` BEFORE opening the dialog:
```javascript
// Step 1: Set unit (evaluate)
_uinfo.DUnit = 1;  // 1=ml, 0=oz

// Step 2: Click "Bottle" link (act)

// Step 3: Wait 2s, then fill form (evaluate)
```

**Why old approaches failed:**
- `$('#bibunit').innerText = 'ml'` → Only visual, save still uses `_uinfo.DUnit`
- `_uinfo.DUnit = 1` after dialog open → Dialog already built with oz dropdowns
- Click on `#bibunit` → It's a plain `<span>`, no onclick handler exists

Source code proof (from `showBibDlg()`):
```javascript
var sizes = _uinfo.DUnit == 1 ? _mlSize : _ozSize;
var unit = ' ' + (_uinfo.DUnit == 1 ? getLabel(Labels.ml) : getLabel(Labels.oz));
```

---

## Weight Dialog Issues

**Problem:** Weight dialog doesn't appear / crashes with "Cannot read properties of undefined (reading 'Name')"

**Root Cause (2026-02-10):** `showWeightDlg()` requires `_dlg.kid` to be set, which only happens when a specific child tab is selected. On the "All Children" tab, `_dlg.kid` is undefined.

**Solution:** Select a child tab BEFORE clicking Weight:
```
1. act: click child tab (e.g., "Quinn Erika Kessler")
2. wait: 1s
3. act: click "Weight" link
4. wait: 2s
5. evaluate: fill form + save
```

---

## Common Errors

| Issue | Symptom | Fix |
|-------|---------|-----|
| Unit wrong on save | 60 oz instead of 60 ml | Set `_uinfo.DUnit = 1` BEFORE opening dialog |
| Weight dialog crash | "reading 'Name'" error | Select child tab first |
| Wrong quantity selector | Value doesn't save | Use `#bibsize input` not `#idQty` |
| Missing change event | Form doesn't update | Dispatch both `change` AND `input` events |
| Using ref-based clicking | "Unknown ref" errors | Use `evaluate` with JavaScript |
| Fixed wait too short | Elements not found | Increase wait to 2000ms or use polling |
| Dialog not open | All fields missing | Verify dialog link was clicked |
| Save does nothing | Button exists but no effect | Check if disabled, check required fields |
| Fields blank/disabled | Can't enter data | Must select child first |
| Wrong entry deleted | Similar text matched | Add TARGET_TIME for precision |

---

## Session Issues

### Detecting Expired Session
```javascript
(() => {
  if (document.querySelector('#username') || document.querySelector('#password')) {
    return 'ERR: Session expired - login required';
  }
  if (document.querySelector('.st')) {
    return 'OK: Session active';
  }
  return 'ERR: Unknown page state';
})()
```

### Re-login Procedure
1. Navigate to `https://www.babyconnect.com/login`
2. Fill `#username` and `#password`
3. Click `#save`
4. Wait 3-5 seconds
5. Verify at `/home2`

**Never paste credentials in logs.** Use 1Password or env vars.

---

## Error Codes

All snippets return structured responses:
- `OK: <description>` — Success
- `ERR: <description>` — Failure with reason

### Common ERR Messages

| Error | Meaning | Action |
|-------|---------|--------|
| `ERR: Dialog not ready` | Elements missing | Wait longer or re-open dialog |
| `ERR: Child not found` | Invalid child ID | Verify dlgKid ID |
| `ERR: Unit mismatch` | Unit toggle failed | Set _uinfo.DUnit BEFORE dialog |
| `ERR: Save button not found` | Dialog closed/stuck | Reload page, retry |
| `ERR: Session expired` | Not logged in | Re-run login procedure |
| `ERR: Summary missing quantity` | React state desync | Retry with native setter |

---

## Why ref-based Clicking Fails

Baby Connect is a legacy **Single Page Application**. The DOM re-renders frequently, causing element references (`ref` IDs from browser snapshots) to expire almost immediately.

- Standard browser `click`/`type` actions fail ~95% of the time
- **Solution:** Always use `browser.evaluate` with JavaScript
- JavaScript runs in page context where CSS selectors remain stable

---

## Combobox/Dropdown Selection Issues

**Problem:** Selecting from dropdowns (e.g., Diaper Quantity) appears to work but selection is lost on save.

**Root Cause:** Clicking the combobox opens the dropdown, but the visible option is NOT automatically selected. You must explicitly click on the option itself.

**Correct Pattern:**
```javascript
// 1. Open dropdown
document.querySelector('#diapersize').click();
// 2. Click the specific option
document.querySelector('option[value="Large"]').click();
// 3. Verify
const selected = document.querySelector('#diapersize').value;
```

**General Rule:** Dropdown selections require clicking both the trigger AND the option.
