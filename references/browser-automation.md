# Browser Automation Reference

Complete procedures for logging baby activities via browser automation.

## Table of Contents

1. [React SPA Rules](#react-spa-rules)
2. [Defensive Verification](#defensive-verification)
3. [Log Bottle](#log-bottle)
4. [Log Diaper](#log-diaper)
5. [Log Nursing](#log-nursing)
6. [Log Sleep](#log-sleep)
7. [Utility Commands](#utility-commands)
8. [Troubleshooting](#troubleshooting)

---

## React SPA Rules

Baby Connect is a **React Single Page Application**. React ignores native DOM events.

| Action Type | Method | Works? |
|-------------|--------|--------|
| Clicking divs (child, diaper type) | `act` with `kind: click` | ✅ YES |
| Selecting dropdowns | `act` with `kind: select` | ✅ YES |
| JavaScript `element.click()` | `evaluate` | ❌ NO - React ignores it |
| Text input fields | `evaluate` with native setter + form activation | ✅ YES |

**Rule of thumb:** 
1. Always activate the form first with a native `act` click (e.g., select child)
2. For text inputs, use native value setter + full event sequence
3. For clicks, ALWAYS use Playwright's native `act` actions

---

## Defensive Verification

Before saving ANY entry, verify the summary text matches the intent:

```javascript
// Pre-save verification - ALWAYS run this before clicking Save
const verifySummary = (expectedValue, expectedUnit = 'ml') => {
  const summary = document.querySelector('#dlgDesc, .dlg-desc, [class*="dlg-desc"]')?.innerText || '';
  
  // Check value appears in summary
  if (!summary.includes(String(expectedValue))) {
    return `ERROR: Value mismatch. Expected ${expectedValue} in "${summary}"`;
  }
  
  // Check unit (for bottle entries)
  if (expectedUnit && !summary.toLowerCase().includes(expectedUnit.toLowerCase())) {
    return `ERROR: Unit mismatch. Expected ${expectedUnit} in "${summary}"`;
  }
  
  return `VERIFIED: ${summary}`;
};
```

**Why this matters:**
- Catches React state desync (DOM shows value but React hasn't updated)
- Catches unit mismatches (UI shows "oz" instead of "ml")
- Prevents silent data corruption

---

## Log Bottle

### ⚠️ Unit Fix (2026-02-10)

**`_uinfo.DUnit` must be set BEFORE opening the dialog.** The dialog reads it at
creation time to build dropdown options and unit labels. Setting it after open = no effect.

Source proof: `showBibDlg()` → `var sizes = _uinfo.DUnit == 1 ? _mlSize : _ozSize;`

### Complete Working Method

**Step 1:** Set unit BEFORE opening dialog
```javascript
browser action=evaluate targetId=<tab> request={"fn": "() => { _uinfo.DUnit = 1; return 'ml'; }"}
```

**Step 2:** Open dialog
```
browser action=act targetId=<tab> request={"kind": "click", "ref": "<bottle_link_ref>"}
browser action=act targetId=<tab> request={"kind": "wait", "timeMs": 2000}
```

**Step 3:** Fill form + save
```javascript
(async () => {
  const CHILD_ID = '4744184165629952';  // Quinn
  const VALUE = 120;
  
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(200);
  
  // Select child (form activation)
  document.getElementById('dlgKid-' + CHILD_ID)?.click();
  await sleep(200);
  
  // Set value
  const input = document.getElementById('bibquantity');
  if (input) {
    const nativeInputSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputSetter.call(input, VALUE);
    
    input.focus();
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('change', {bubbles: true}));
    input.blur();
  }
  
  // Dismiss autocomplete
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  await sleep(200);
  
  // Verify summary
  const summary = document.querySelector('#dlgDesc, #txt')?.innerText || '';
  if (!summary.includes(String(VALUE)) || !summary.toLowerCase().includes('ml')) {
    return `ERROR: Summary mismatch. Got: ${summary}`;
  }
  
  document.querySelector('button.save, #dlgSave')?.click();
  return 'OK';
})()
```

---

## Log Diaper

This is the **proven working method** as of 2026-01-23.

### Step 1: Ensure browser is on Baby Connect
```
browser action=tabs profile=clawd
```
Should show `https://www.babyconnect.com/home2`

### Step 2: Take snapshot and click "Diaper" link
```
browser action=snapshot profile=clawd targetId=<tab_id>
```
Find: `link "Diaper" [ref=eXX]`

```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "click", "ref": "eXX"}
```

### Step 3: Wait for dialog to open
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "wait", "timeMs": 1500}
```

### Step 4: Take snapshot of dialog
```
browser action=snapshot profile=clawd targetId=<tab_id>
```

You'll see a structure like:
```
dialog "Diaper" [ref=e2035]:
  - generic [ref=e2044]: Logan Sophia Kessler     ← Child option
  - generic [ref=e2048]: Quinn Erika Kessler      ← Child option (click this)
  - generic [ref=e2061]: BM                       ← Type option
  - generic [ref=e2062]: BM + Wet                 ← Type option (click this for poopy+wet)
  - generic [ref=e2063]: Wet                      ← Type option
  - generic [ref=e2064]: Dry                      ← Type option
  - combobox [ref=e2078]:                         ← Size dropdown
      option "Small"
      option "Medium"
      option "Large"
  - textbox: <name> had a wet diaper              ← Summary (updates as you select)
  - button "Save" [ref=e2091]                     ← Save button
```

### Step 5: Click the child (Quinn)
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "click", "ref": "<quinn_ref>"}
```

### Step 6: Click the diaper type (e.g., "BM + Wet")
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "click", "ref": "<bm_wet_ref>"}
```

### Step 7: Select the size
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "select", "ref": "<combobox_ref>", "values": ["Medium"]}
```

### Step 8: VERIFY before saving (take another snapshot)
```
browser action=snapshot profile=clawd targetId=<tab_id>
```

**Check the summary textbox.** It should show:
```
textbox: Quinn Erika Kessler had a BM and wet diaper (medium)
```

If it still says "wet diaper" without "BM", the type click didn't register. Re-click the type.

### Step 9: Click Save
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "click", "ref": "<save_ref>"}
```

### Step 10: Verify entry was created
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "evaluate", "fn": "() => document.querySelector('.st .st_tl')?.innerText || 'ERR: No entry'"}
```

Should return something like:
```
Quinn Erika Kessler had a BM and wet diaper (medium)
```

---

## Log Nursing

### Quick Method (Construct JS dynamically)

```javascript
(async () => {
  const CHILD_ID = '4744184165629952';  // Quinn
  const LEFT_MINS = 5;
  const RIGHT_MINS = 10;
  const TIME = '8:15AM';
  
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  await sleep(1500);
  
  // Select child (form activation)
  document.getElementById('dlgKid-' + CHILD_ID)?.click();
  await sleep(200);
  
  // Set time if provided
  if (TIME) {
    const timeInput = document.getElementById('timeinput');
    if (timeInput) {
      timeInput.value = TIME;
      timeInput.dispatchEvent(new Event('change', {bubbles: true}));
    }
  }
  
  if (LEFT_MINS > 0) {
    const left = document.getElementById('left_side');
    if (left) { 
      left.value = LEFT_MINS; 
      left.dispatchEvent(new Event('input', {bubbles: true})); 
    }
  }
  
  if (RIGHT_MINS > 0) {
    const right = document.getElementById('right_side');
    if (right) { 
      right.value = RIGHT_MINS; 
      right.dispatchEvent(new Event('input', {bubbles: true})); 
    }
  }
  
  // Verify summary
  const summary = document.querySelector('#dlgDesc, .dlg-desc')?.innerText || '';
  if (!summary.includes(`${LEFT_MINS}m left`) && !summary.includes(`${RIGHT_MINS}m right`)) {
    return `ERROR: Summary mismatch. Got: ${summary}`;
  }
  
  document.querySelector('button.save, #dlgSave')?.click();
  return 'OK';
})()
```

---

## Log Sleep

### Quick Method (Construct JS dynamically)

```javascript
(async () => {
  const CHILD_ID = '4744184165629952';  // Quinn
  const START_TIME = '';  // Empty = now, or '10:00PM'
  const END_TIME = '';    // Empty = ongoing
  
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  await sleep(1500);
  
  // Select child (form activation)
  document.getElementById('dlgKid-' + CHILD_ID)?.click();
  await sleep(200);
  
  if (START_TIME) {
    const start = document.getElementById('timeinput');
    if (start) { 
      start.value = START_TIME; 
      start.dispatchEvent(new Event('change', {bubbles: true})); 
    }
  }
  
  if (END_TIME) {
    const end = document.getElementById('endtimeinput');
    if (end) { 
      end.value = END_TIME; 
      end.dispatchEvent(new Event('change', {bubbles: true})); 
    }
  }
  
  // Verify summary
  const summary = document.querySelector('#dlgDesc, .dlg-desc')?.innerText || '';
  if (START_TIME && !summary.includes(START_TIME)) {
    return `ERROR: Summary mismatch. Got: ${summary}`;
  }
  
  document.querySelector('button.save, #dlgSave')?.click();
  return 'OK';
})()
```

---

## Utility Commands

### Check Recent Activity
```javascript
(() => {
  const entries = document.querySelectorAll('.st');
  const results = [];
  for (let i = 0; i < Math.min(entries.length, 5); i++) {
    const title = entries[i].querySelector('.st_tl')?.innerText || '';
    const time = entries[i].querySelector('.st_dsc')?.innerText?.split('\n')[0] || '';
    if (title) results.push(title + ' | ' + time);
  }
  return results.join('\n') || 'No entries';
})()
```

### Check Session Status
```javascript
(() => {
  if (document.querySelector('#username')) return 'LOGIN_REQUIRED';
  if (document.querySelector('.st')) return 'SESSION_ACTIVE';
  return 'UNKNOWN';
})()
```

### Edit Entry

**Step 1:** Click edit on the entry
```javascript
(() => {
  const TARGET = 'wet diaper';  // Text to match
  for (const entry of document.querySelectorAll('.st')) {
    if (entry.querySelector('.st_tl')?.innerText.includes(TARGET)) {
      entry.querySelector('a.edit')?.click();
      return 'CLICKED_EDIT';
    }
  }
  return 'NOT_FOUND';
})()
```

**Step 2:** Wait 1.5 seconds for dialog

**Step 3:** Take snapshot, find type/size refs

**Step 4:** Use native `act` clicks to change type and `act` select for size

**Step 5:** Verify summary textbox shows expected text

**Step 6:** Click Save with native `act`

### Delete Entry

**Step 1:** Click delete on matching entry
```javascript
(() => {
  const TARGET = 'wet diaper (small)';  // Text to match
  for (const entry of document.querySelectorAll('.st')) {
    if (entry.querySelector('.st_tl')?.innerText.includes(TARGET)) {
      entry.querySelector('a.delete')?.click();
      return 'CLICKED_DELETE';
    }
  }
  return 'NOT_FOUND';
})()
```

**Step 2:** Wait 1 second for confirmation dialog

**Step 3:** Take snapshot with `interactive=true` to find Ok button ref
```
browser action=snapshot profile=clawd targetId=<tab_id> interactive=true
```
Look for: `button "Ok" [ref=eXX]`

**Step 4:** Click Ok with **native `act` click** (JavaScript click doesn't work!)
```
browser action=act profile=clawd targetId=<tab_id> request={"kind": "click", "ref": "<ok_button_ref>"}
```

**⚠️ Important:** The confirmation dialog's Ok button MUST be clicked with native `act` — JavaScript `button.click()` does not trigger the deletion!

### Login (if needed)

```javascript
(() => {
  document.querySelector('#username').value = 'EMAIL';
  document.querySelector('#password').value = 'PASSWORD';
  document.querySelector('#save').click();
  return 'LOGIN_SUBMITTED';
})()
```

Get password: `op read "op://Clawd/Baby Connect/password"`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Diaper type not saving | Use `act` native clicks, NOT `evaluate` |
| Child not selected | Use `act` click, verify checkmark in snapshot |
| "Please select a child" error | Re-click child with `act`, wait, try again |
| Delete not working | Confirmation Ok button needs native `act` click |
| Bottle value not sticking | Ensure child selected FIRST (form activation) |
| Wrong bottle unit (oz vs ml) | Set `_uinfo.DUnit` BEFORE opening dialog (not after) |
| Summary verification fails | Take snapshot, check exact text format |
| Refs changed between calls | Take fresh snapshot before each action |
| Session expired | Re-login, verify with session check |

---

## Key Learnings

### React SPA Automation
1. **Always activate form first** — Select child or click within dialog to "warm up" React's event system
2. **Native clicks for UI elements** — `act` with `kind: click` triggers React synthetic events
3. **Native setter for inputs** — Use `Object.getOwnPropertyDescriptor` setter, not `input.value = x`
4. **Full event sequence** — `focus → set → input → change → blur` for React to recognize changes

### Unit Handling (Updated 2026-02-10)
1. **Set `_uinfo.DUnit` BEFORE opening dialog** — `1` = ml, `0` = oz
2. **Do NOT try to toggle after dialog open** — `#bibunit` is a plain span with no onclick
3. **Verify in summary (`#txt`)** — Confirm unit appears correctly before save

### Defensive Verification
1. **Pre-save check** — Always verify summary text matches intent
2. **Check both value and unit** — Prevents silent data corruption
3. **Return explicit errors** — `"ERROR: ..."` messages help debug issues
