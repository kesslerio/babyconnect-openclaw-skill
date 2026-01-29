---
name: babyconnect-browser
description: Log baby activities (bottles, nursing, diapers, sleep) to Baby Connect via browser automation. For Quinn and Logan Kessler. Use when asked to "log a diaper", "record feeding", "track bottle", "baby ate", "Quinn had a poopy diaper", "log nursing", "baby is sleeping", "record nap", "diaper change", "fed the baby".
metadata: {"moltbot": {"emoji": "👶", "requires": {"tools": ["browser", "exec"]}}}
---

# Baby Connect Browser Skill

Automate baby tracking on babyconnect.com using the `browser` tool.

---

## Children

| Name | Child ID | Notes |
|------|----------|-------|
| Quinn Erika Kessler | `4744184165629952` | Newborn (Jan 2026) |
| Logan Sophia Kessler | `5765432109876543` | Big sister (Sep 2020) |

**Default child:** Quinn (unless explicitly asked about Logan)

---

## Authentication

Credentials stored in 1Password:
- **Vault:** `Clawd`
- **Item:** `Baby Connect`
- **Fields:** `username`, `password`

Retrieve password:
```bash
op read "op://Clawd/Baby Connect/password"
```

---

## Method Selection Guide

| Activity | Method | Why |
|----------|--------|-----|
| **Diaper** | Native `act` clicks | Type/size selection needs React event system |
| **Bottle** | `evaluate` snippet with unit toggle | Input fields + unit detection required |
| **Nursing** | `evaluate` snippet | Input fields work with JS value setting |
| **Sleep** | `evaluate` snippet | Input fields work with JS value setting |
| **Edit/Delete** | Mixed | Find with evaluate, confirm with `act` |

---

## ⚠️ CRITICAL: React SPA Automation Rules

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

## 🔒 Defensive Verification Pattern (NEW)

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

## 🍼 Log Bottle (React-Safe + Unit Handling)

### Complete Working Method (2026-01-29)

```javascript
(async () => {
  const CHILD_ID = '4744184165629952';  // Quinn
  const QUANTITY = 90;                  // Amount
  const UNIT = 'ml';                    // 'ml' or 'oz'
  const TIME = '8:15AM';                // Time string
  
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  // Native setter that React respects
  const setNativeValue = (el, val) => {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    desc ? desc.set.call(el, val) : (el.value = val);
  };
  
  const dispatch = (el, type) => {
    el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
  };
  
  // Wait for dialog
  await sleep(400);
  
  // STEP 1: Select child (CRITICAL - activates form for React)
  const childEl = document.getElementById('dlgKid-' + CHILD_ID);
  if (childEl) {
    childEl.click();
    await sleep(200);
  }
  
  // STEP 2: Check and toggle unit if needed
  const unitEl = document.getElementById('bibunit');
  const currentUnit = unitEl?.innerText?.toLowerCase() || 'oz';
  
  if (currentUnit !== UNIT.toLowerCase()) {
    // Click unit toggle to switch
    const unitToggle = document.querySelector('.unit-toggle, [data-testid="unit-toggle"], #bibunit');
    if (unitToggle) {
      unitToggle.click();
      await sleep(250); // Wait for unit switch animation
      
      // VERIFY toggle worked
      const newUnit = document.getElementById('bibunit')?.innerText?.toLowerCase();
      if (newUnit !== UNIT.toLowerCase()) {
        return `ERROR: Unit toggle failed. Expected ${UNIT}, still ${newUnit}`;
      }
    }
  }
  
  // STEP 3: Set time
  const timeInput = document.querySelector('#timeinput');
  if (timeInput && TIME) {
    timeInput.focus();
    setNativeValue(timeInput, TIME);
    dispatch(timeInput, 'input');
    dispatch(timeInput, 'change');
    timeInput.blur();
    await sleep(80);
  }
  
  // STEP 4: Set quantity with React-aware sequence
  const input = document.querySelector('#bibsize input');
  if (!input) return 'ERROR: Quantity input not found';
  
  // Focus and clear
  input.focus();
  setNativeValue(input, '');
  dispatch(input, 'input');
  await sleep(50);
  
  // Set value with full event sequence
  setNativeValue(input, String(QUANTITY));
  dispatch(input, 'input');
  dispatch(input, 'change');
  await sleep(50);
  
  input.blur();
  dispatch(input, 'blur');
  await sleep(80);
  
  // Close any dropdown
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await sleep(30);
  
  // STEP 5: Verify quantity stuck
  if (input.value !== String(QUANTITY)) {
    // Retry with character-by-character input
    input.focus();
    setNativeValue(input, '');
    for (const ch of String(QUANTITY)) {
      setNativeValue(input, (input.value || '') + ch);
      dispatch(input, 'input');
      await sleep(20);
    }
    dispatch(input, 'change');
    input.blur();
    await sleep(100);
  }
  
  if (input.value !== String(QUANTITY)) {
    return `ERROR: Quantity verification failed. Expected ${QUANTITY} but got ${input.value}`;
  }
  
  // STEP 6: CRITICAL - Verify summary before save
  const summary = document.querySelector('#dlgDesc, .dlg-desc, [class*="dlg-desc"]')?.innerText || '';
  
  if (!summary.includes(String(QUANTITY))) {
    return `ERROR: Summary mismatch (value). Expected ${QUANTITY} in "${summary}"`;
  }
  
  if (!summary.toLowerCase().includes(UNIT.toLowerCase())) {
    return `ERROR: Summary mismatch (unit). Expected ${UNIT} in "${summary}"`;
  }
  
  // STEP 7: Save
  const saveBtn = document.querySelector('button.save, #dlgSave, [data-testid="save"]');
  if (!saveBtn) return 'ERROR: Save button not found';
  
  saveBtn.click();
  return `SAVED: ${QUANTITY}${UNIT} at ${TIME}`;
})()
```

### Step-by-Step

1. **Open bottle dialog** (native `act` click on Bottle link)
2. **Execute the JS above** via `evaluate` with appropriate parameters
3. **Check return value:**
   - `"SAVED: ..."` → Success
   - `"ERROR: ..."` → Failed, check message for details

### Key Improvements (2026-01-29)

| Issue | Fix | Where |
|-------|-----|-------|
| React state desync | Form activation via child selection first | Step 1 |
| Wrong unit (oz vs ml) | Explicit unit detection + toggle | Step 2 |
| Silent save failures | Pre-save summary verification | Step 6 |
| Value not sticking | Native setter + full event sequence | Step 4 |

---

## 🧷 Log Diaper (Step-by-Step)

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

## 🤱 Log Nursing

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

## 😴 Log Sleep

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

---

## Login (if needed)

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
| Wrong bottle unit (oz vs ml) | Check `bibunit` element, click toggle to switch |
| Summary verification fails | Take snapshot, check exact text format |
| Refs changed between calls | Take fresh snapshot before each action |
| Session expired | Re-login, verify with session check |

---

## Key Learnings (2026-01-29)

### React SPA Automation
1. **Always activate form first** — Select child or click within dialog to "warm up" React's event system
2. **Native clicks for UI elements** — `act` with `kind: click` triggers React synthetic events
3. **Native setter for inputs** — Use `Object.getOwnPropertyDescriptor` setter, not `input.value = x`
4. **Full event sequence** — `focus → set → input → change → blur` for React to recognize changes

### Unit Handling
1. **Check current unit** — Read `#bibunit` innerText before setting quantity
2. **Toggle if needed** — Click unit toggle, wait 300ms for animation
3. **Verify in summary** — Confirm unit appears correctly before save

### Defensive Verification
1. **Pre-save check** — Always verify summary text matches intent
2. **Check both value and unit** — Prevents silent data corruption
3. **Return explicit errors** — `"ERROR: ..."` messages help debug issues

---

## Changelog

### 2026-01-29
- **Added:** Defensive summary verification pattern
- **Added:** Explicit unit detection and toggle handling
- **Improved:** Bottle logging with form activation step
- **Fixed:** React state desync issues with proper event sequence
- **Removed:** Legacy TODO items (now implemented)