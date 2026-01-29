// Diaper Change Snippet
// Prerequisites: Dialog opened with showDiaperDlg(), waited 1.5s

(async () => {
  try {
    // === PARAMETERS ===
    const CHILD_ID = '4744184165629952';  // Quinn
    const DIAPER_TYPE = 'BM + Wet';  // 'BM', 'BM + Wet', 'Wet', 'Dry'
    const SIZE = 'Large';  // 'Small', 'Medium', 'Large'
    const DIAPER_CREAM = false;
    const LEAK = false;
    const NOTES = '';  // Optional notes
    // === END PARAMETERS ===

    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(1500);

    // 1. Select child
    const childEl = document.getElementById('dlgKid-' + CHILD_ID);
    if (!childEl) return 'ERR: Child not found';
    childEl.click();
    await wait(300);

    // 2. Select diaper type - search visible divs with exact text match
    let typeFound = false;
    const typeButtons = document.querySelectorAll('div[role="button"], div.selectable, div[data-type]');
    for (const div of typeButtons) {
      if (div.innerText?.trim() === DIAPER_TYPE && div.offsetParent !== null) {
        div.click();
        typeFound = true;
        await wait(200);
        break;
      }
    }
    // Fallback: broader search
    if (!typeFound) {
      for (const div of document.querySelectorAll('div')) {
        const text = div.innerText?.trim();
        // Exact match only, visible element, not a container
        if (text === DIAPER_TYPE && div.offsetParent !== null && div.children.length === 0) {
          div.click();
          typeFound = true;
          await wait(200);
          break;
        }
      }
    }
    if (!typeFound) {
      return 'ERR: Diaper type not found: ' + DIAPER_TYPE;
    }

    // 3. Select size - detect dropdown type and handle appropriately
    let sizeSet = false;
    
    // Strategy A: Native <select> element
    const selects = document.querySelectorAll('select');
    for (const sel of selects) {
      const container = sel.closest('div');
      const labelText = container?.innerText?.toLowerCase() || '';
      if (labelText.includes('quantity') || labelText.includes('size')) {
        // Set value directly and trigger events
        for (const opt of sel.options) {
          if (opt.text === SIZE || opt.value === SIZE) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', {bubbles: true}));
            sel.dispatchEvent(new Event('input', {bubbles: true}));
            sizeSet = true;
            break;
          }
        }
        if (sizeSet) break;
      }
    }

    // Strategy B: Custom dropdown (Selectize, etc.)
    if (!sizeSet) {
      // Find and click the dropdown trigger
      const dropdownTriggers = document.querySelectorAll('.selectize-input, [class*="dropdown"], [class*="combobox"]');
      for (const trigger of dropdownTriggers) {
        const container = trigger.closest('div');
        if (container?.innerText?.toLowerCase().includes('quantity')) {
          trigger.click();
          await wait(300);
          
          // Find and click the option in the opened dropdown
          const options = document.querySelectorAll('.selectize-dropdown-content div, [class*="dropdown-item"], [role="option"]');
          for (const opt of options) {
            if (opt.innerText?.trim() === SIZE) {
              opt.click();
              sizeSet = true;
              await wait(200);
              break;
            }
          }
          break;
        }
      }
    }

    // Strategy C: Last resort - find any element with size text and click
    if (!sizeSet) {
      // Look for visible size options
      for (const el of document.querySelectorAll('div, span, option')) {
        if (el.innerText?.trim() === SIZE && el.offsetParent !== null) {
          el.click();
          await wait(200);
          // Check if something changed
          sizeSet = true;
          break;
        }
      }
    }

    // Note: Size selection is optional - some dialogs may not have it
    // Log but don't fail if size couldn't be set

    // 4. Optional checkboxes
    if (DIAPER_CREAM || LEAK) {
      document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const label = cb.parentElement?.innerText?.toLowerCase() || '';
        if (DIAPER_CREAM && label.includes('cream') && !cb.checked) cb.click();
        if (LEAK && label.includes('leak') && !cb.checked) cb.click();
      });
    }

    // 5. Optional notes
    if (NOTES) {
      const notesInput = document.querySelector('textarea, input[name*="note"], #notes');
      if (notesInput) {
        notesInput.value = NOTES;
        notesInput.dispatchEvent(new Event('change', {bubbles: true}));
        notesInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 6. Save
    for (const btn of document.querySelectorAll('button')) {
      if (btn.innerText?.includes('Save') && !btn.disabled) {
        btn.click();
        const sizeInfo = sizeSet ? ' (' + SIZE + ')' : '';
        return 'OK: Saved ' + DIAPER_TYPE + ' diaper' + sizeInfo;
      }
    }
    return 'ERR: Save button not found or disabled';
  } catch (e) {
    return 'ERR: ' + e.message;
  }
})()
