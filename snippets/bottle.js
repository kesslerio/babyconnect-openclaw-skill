// Bottle Feeding Snippet
// Prerequisites: Dialog opened with showBibDlg(), waited 1.5s

(async () => {
  try {
    // === PARAMETERS (modify these) ===
    const CHILD_ID = '4744184165629952';  // Quinn
    const QUANTITY = 60;
    const UNIT = 'ml';  // 'ml' or 'oz'
    const TYPE = 'Milk';  // 'Milk' or 'Formula'
    const DURATION_MINS = 10;
    const START_TIME = '';  // Empty = current time, or '10:02PM'
    const NOTES = '';  // Optional notes
    // === END PARAMETERS ===

    await new Promise(r => setTimeout(r, 1500));
    
    // Validate dialog
    const required = ['#bibsize input', '#bibunit', '#bibMilk'];
    const missing = required.filter(s => !document.querySelector(s));
    if (missing.length > 0) return 'ERR: Dialog not ready, missing: ' + missing.join(', ');

    // 1. Select child
    const childEl = document.getElementById('dlgKid-' + CHILD_ID);
    if (!childEl) return 'ERR: Child not found: ' + CHILD_ID;
    childEl.click();

    // 2. Set start time if specified
    if (START_TIME) {
      const startInput = document.getElementById('timeinput');
      if (startInput) {
        startInput.value = START_TIME;
        startInput.dispatchEvent(new Event('change', {bubbles: true}));
        startInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 3. Set duration
    const mDur = document.getElementById('mduration');
    if (mDur) mDur.value = DURATION_MINS.toString();

    // 4. CRITICAL: Set unit BEFORE quantity
    if (UNIT === 'ml') {
      if (typeof _uinfo !== 'undefined') _uinfo.DUnit = 1;
      const unitSpan = document.getElementById('bibunit');
      if (unitSpan) unitSpan.innerText = 'ml';
    } else {
      if (typeof _uinfo !== 'undefined') _uinfo.DUnit = 0;
      const unitSpan = document.getElementById('bibunit');
      if (unitSpan) unitSpan.innerText = 'oz';
    }
    
    // Verify unit was set correctly
    const unitCheck = document.getElementById('bibunit')?.innerText;
    if (unitCheck !== UNIT) return 'ERR: Unit mismatch - expected ' + UNIT + ', got ' + unitCheck;

    // 5. Set quantity
    const qtyInput = document.querySelector('#bibsize input');
    if (!qtyInput) return 'ERR: Quantity input not found';
    qtyInput.value = QUANTITY.toString();
    qtyInput.dispatchEvent(new Event('change', {bubbles: true}));
    qtyInput.dispatchEvent(new Event('input', {bubbles: true}));

    // 6. Select type
    const typeRadio = document.getElementById(TYPE === 'Milk' ? 'bibMilk' : 'bibFormula');
    if (typeRadio) typeRadio.click();

    // 7. Optional notes
    if (NOTES) {
      const notesInput = document.querySelector('textarea, input[name*="note"], #notes');
      if (notesInput) {
        notesInput.value = NOTES;
        notesInput.dispatchEvent(new Event('change', {bubbles: true}));
        notesInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 8. Save
    for (const btn of document.querySelectorAll('button')) {
      if (btn.innerText?.includes('Save') && !btn.disabled) {
        btn.click();
        return 'OK: Saved ' + QUANTITY + UNIT + ' ' + TYPE;
      }
    }
    return 'ERR: Save button not found or disabled';
  } catch (e) {
    return 'ERR: ' + e.message;
  }
})()
