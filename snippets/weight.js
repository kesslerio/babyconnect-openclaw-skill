// Weight Entry Snippet
// Prerequisites:
//   1. Select child tab first (e.g., click "Quinn Erika Kessler" tab)
//   2. Click "Weight" link to open dialog
//   3. Wait 2s
//   4. Execute this snippet via evaluate
//
// The weight dialog uses radio buttons for unit (lbs/lbs_oz/kg)
// and combobox dropdowns for the value.

(async () => {
  try {
    // === PARAMETERS (modify these) ===
    const CHILD_ID = '4744184165629952';  // Quinn
    const WEIGHT_UNIT = 'kg';  // 'lbs', 'lbs_oz', or 'kg'
    const WEIGHT_WHOLE = 4;    // Whole number part (lbs or kg)
    const WEIGHT_DECIMAL = 5;  // Decimal part (0-9): for lbs = tenths, for kg = tenths
    const WEIGHT_OZ = 0;       // Only used for lbs_oz unit (0-15 oz)
    const START_TIME = '';      // Empty = current time, or '10:02PM'
    const NOTES = '';           // Optional notes
    // === END PARAMETERS ===

    await new Promise(r => setTimeout(r, 500));

    // Validate dialog elements exist
    const unitRadios = document.querySelectorAll('#post_dlg_c input[name="unit"]');
    if (unitRadios.length === 0) return 'ERR: Weight dialog not ready — unit radios not found';

    // 1. Select child
    const childEl = document.getElementById('dlgKid-' + CHILD_ID);
    if (childEl) {
      childEl.click();
      await new Promise(r => setTimeout(r, 200));
    }

    // 2. Set start time if specified
    if (START_TIME) {
      const startInput = document.getElementById('timeinput');
      if (startInput) {
        startInput.value = START_TIME;
        startInput.dispatchEvent(new Event('change', { bubbles: true }));
        startInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // 3. Select unit radio
    const unitMap = { 'lbs': '1', 'lbs_oz': '2', 'kg': '3' };
    const unitValue = unitMap[WEIGHT_UNIT];
    if (!unitValue) return 'ERR: Invalid unit: ' + WEIGHT_UNIT + '. Use lbs, lbs_oz, or kg';

    const unitRadio = document.querySelector('#post_dlg_c input[name="unit"][value="' + unitValue + '"]');
    if (unitRadio) {
      unitRadio.click();
      await new Promise(r => setTimeout(r, 300));
    } else {
      return 'ERR: Unit radio not found for value ' + unitValue;
    }

    // 4. Set weight value via the dropdown selects
    const selects = document.querySelectorAll('#post_dlg_c select');

    if (selects.length >= 1) {
      selects[0].value = String(WEIGHT_WHOLE);
      selects[0].dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));
    }

    if (selects.length >= 2) {
      if (WEIGHT_UNIT === 'lbs_oz') {
        selects[1].value = String(WEIGHT_OZ);
      } else {
        selects[1].value = String(WEIGHT_DECIMAL);
      }
      selects[1].dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));
    }

    if (WEIGHT_UNIT === 'lbs_oz' && selects.length >= 3) {
      selects[2].value = String(WEIGHT_DECIMAL);
      selects[2].dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 100));
    }

    // 5. Trigger text update
    if (typeof _dlg !== 'undefined' && _dlg.setDlgText) {
      _dlg.setDlgText();
      await new Promise(r => setTimeout(r, 100));
    }

    // 6. Verify summary
    const summary = document.getElementById('txt')?.value || '';
    if (!summary.includes('weight')) {
      return 'ERR: Summary does not look like a weight entry: "' + summary + '"';
    }

    // 7. Optional notes
    if (NOTES) {
      const notesInput = document.querySelector('textarea, input[name*="note"], #notes');
      if (notesInput) {
        notesInput.value = NOTES;
        notesInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // 8. Save
    for (const btn of document.querySelectorAll('button')) {
      if (btn.innerText?.trim() === 'Save' && !btn.disabled) {
        btn.click();
        const unitLabel = WEIGHT_UNIT === 'lbs_oz'
          ? WEIGHT_WHOLE + ' lbs ' + WEIGHT_OZ + ' oz'
          : WEIGHT_WHOLE + '.' + WEIGHT_DECIMAL + ' ' + WEIGHT_UNIT;
        return 'OK: Saved weight ' + unitLabel;
      }
    }
    return 'ERR: Save button not found or disabled';
  } catch (e) {
    return 'ERR: ' + e.message;
  }
})()
