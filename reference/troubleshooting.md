# Baby Connect Troubleshooting

## Contents
1. [Unit Toggle Issues](#unit-toggle-issues)
2. [Common Errors](#common-errors)
3. [Session Issues](#session-issues)
4. [Error Codes](#error-codes)

---

## Unit Toggle Issues

**Problem:** Entry shows oz when you wanted ml (or vice versa)

**Root Cause:** Baby Connect defaults to oz. `_uinfo.DUnit` must be set BEFORE quantity.

**Solution:**
```javascript
// CORRECT ORDER:
_uinfo.DUnit = 1;  // 1=ml, 0=oz (SET FIRST!)
document.getElementById('bibunit').innerText = 'ml';
// VERIFY:
if (document.getElementById('bibunit').innerText !== 'ml') {
  return 'ERR: Unit did not update';
}
qtyInput.value = '60';  // NOW set quantity
```

---

## Common Errors

| Issue | Symptom | Fix |
|-------|---------|-----|
| Set quantity before unit | 60 oz instead of 60 ml | Set `_uinfo.DUnit = 1` FIRST |
| Wrong quantity selector | Value doesn't save | Use `#bibsize input` not `#idQty` |
| Missing change event | Form doesn't update | Dispatch both `change` AND `input` events |
| Using ref-based clicking | "Unknown ref" errors | ALWAYS use `evaluate` with JavaScript |
| Fixed wait too short | Elements not found | Increase wait to 2000ms or use polling |
| Dialog not open | All fields missing | Verify `showXxxDlg()` returned |
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
| `ERR: Unit mismatch` | Unit toggle failed | Check `_uinfo` exists |
| `ERR: Save button not found` | Dialog closed/stuck | Reload page, retry |
| `ERR: Session expired` | Not logged in | Re-run login procedure |

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

**Failed Pattern:**
```javascript
// ✗ Does NOT work
click(ref e569);           // Opens dropdown (shows "Large")
click_save();              // Saves, but Large not selected!
```

**Correct Pattern:**
```javascript
// ✓ Click the OPTION itself, not just the combobox
click(ref e569);           // Opens dropdown
click(ref "Large option"); // Explicitly click the option
verify(ref e569 shows "Large"); // Confirm selection committed
click_save();
```

**For Diaper Quantity specifically:**
```javascript
// Open dropdown
document.querySelector('#diapersize').click();
// Click the specific option
document.querySelector('option[value="Large"]').click();
// Verify
const selected = document.querySelector('#diapersize').value; // should be "Large"
```

**General Rule:** Dropdown selections require clicking both the trigger AND the option.
