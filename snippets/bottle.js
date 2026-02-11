// Bottle Feeding Snippet
// IMPORTANT: Set _uinfo.DUnit BEFORE opening the dialog.
//   _uinfo.DUnit = 1 → ml (dropdown shows ml sizes: 12,25,37,...,250)
//   _uinfo.DUnit = 0 → oz (dropdown shows oz sizes: 0.5,1,...,10)
// The dialog reads _uinfo.DUnit at creation time to build the dropdown
// and unit label. Changing it after the dialog is open has NO effect.
//
// Workflow:
//   1. evaluate: _uinfo.DUnit = 1  (if ml desired)
//   2. act: click "Bottle" link to open dialog
//   3. wait 1.5-2s
//   4. evaluate: this snippet (fill form + save)

(async () => {
  try {
    // === PARAMETERS (modify these) ===
    const CHILD_ID = '4744184165629952';  // Quinn
    const QUANTITY = 60;
    const TYPE = 'Milk';  // 'Milk', 'Formula', 'Water', or 'Juice'
    const START_TIME = '';  // Empty = current time, or '10:02PM'
    const NOTES = '';  // Optional notes
    // === END PARAMETERS ===
    // NOTE: Unit (ml/oz) is controlled by _uinfo.DUnit set BEFORE dialog open.

    await new Promise(r => setTimeout(r, 500));

    // Validate dialog is open
    const qtyInput = document.querySelector('#bibsize input');
    if (!qtyInput) return 'ERR: Dialog not ready — #bibsize input not found';

    // 1. Select child (activates React form state)
    const childEl = document.getElementById('dlgKid-' + CHILD_ID);
    if (!childEl) return 'ERR: Child not found: ' + CHILD_ID;
    childEl.click();
    await new Promise(r => setTimeout(r, 200));

    // 2. Set start time if specified
    if (START_TIME) {
      const startInput = document.getElementById('timeinput');
      if (startInput) {
        const proto = Object.getPrototypeOf(startInput);
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc) desc.set.call(startInput, START_TIME);
        else startInput.value = START_TIME;
        startInput.dispatchEvent(new Event('change', { bubbles: true }));
        startInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // 3. Select type (Milk/Formula/Water/Juice)
    const typeRadio = document.querySelector('#post_dlg_c input[name="type"][value="' + TYPE + '"]');
    if (typeRadio) typeRadio.click();

    // 4. Set quantity with React-aware native setter
    const proto = Object.getPrototypeOf(qtyInput);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');

    qtyInput.focus();
    if (desc) desc.set.call(qtyInput, '');
    else qtyInput.value = '';
    qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    if (desc) desc.set.call(qtyInput, String(QUANTITY));
    else qtyInput.value = String(QUANTITY);
    qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
    qtyInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));

    qtyInput.blur();
    qtyInput.dispatchEvent(new Event('blur', { bubbles: true }));
    // Dismiss autocomplete dropdown
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 100));

    // 5. Verify quantity stuck
    if (qtyInput.value !== String(QUANTITY)) {
      // Fallback: type char by char
      qtyInput.focus();
      if (desc) desc.set.call(qtyInput, '');
      for (const ch of String(QUANTITY)) {
        const prev = qtyInput.value || '';
        if (desc) desc.set.call(qtyInput, prev + ch);
        else qtyInput.value = prev + ch;
        qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 20));
      }
      qtyInput.dispatchEvent(new Event('change', { bubbles: true }));
      qtyInput.blur();
      await new Promise(r => setTimeout(r, 100));
    }

    if (qtyInput.value !== String(QUANTITY)) {
      return 'ERR: Quantity verification failed. Expected ' + QUANTITY + ' but got ' + qtyInput.value;
    }

    // 6. Verify summary text before saving
    const summary = document.getElementById('txt')?.value || '';
    const unit = _uinfo.DUnit === 1 ? 'ml' : 'oz';

    if (!summary.includes(String(QUANTITY))) {
      return 'ERR: Summary missing quantity. Expected ' + QUANTITY + ' in "' + summary + '"';
    }
    if (!summary.toLowerCase().includes(unit)) {
      return 'ERR: Summary has wrong unit. Expected ' + unit + ' in "' + summary + '"';
    }

    // 7. Optional notes
    if (NOTES) {
      const notesInput = document.querySelector('textarea, input[name*="note"], #notes');
      if (notesInput) {
        notesInput.value = NOTES;
        notesInput.dispatchEvent(new Event('change', { bubbles: true }));
        notesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // 8. Save
    for (const btn of document.querySelectorAll('button')) {
      if (btn.innerText?.trim() === 'Save' && !btn.disabled) {
        btn.click();
        return 'OK: Saved ' + QUANTITY + unit + ' ' + TYPE;
      }
    }
    return 'ERR: Save button not found or disabled';
  } catch (e) {
    return 'ERR: ' + e.message;
  }
})()
