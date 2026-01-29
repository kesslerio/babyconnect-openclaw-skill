// Nursing (Breastfeeding) Snippet
// Prerequisites: Dialog opened with showNursingDlg(), waited 1.5s

(async () => {
  try {
    // === PARAMETERS ===
    const CHILD_ID = '4744184165629952';  // Quinn
    const LEFT_MINUTES = 0;   // Minutes on left side (0 if not used)
    const RIGHT_MINUTES = 5;  // Minutes on right side (0 if not used)
    const LAST_SIDE = 'right'; // 'left' or 'right' - which side was last
    const START_TIME = '';    // Empty = current time, or '11:00PM'
    const NOTES = '';  // Optional notes
    // === END PARAMETERS ===

    await new Promise(r => setTimeout(r, 1500));

    // Validate dialog
    const required = ['#left_side', '#right_side'];
    const missing = required.filter(s => !document.querySelector(s));
    if (missing.length > 0) return 'ERR: Dialog not ready, missing: ' + missing.join(', ');

    // 1. Select child
    const childEl = document.getElementById('dlgKid-' + CHILD_ID);
    if (!childEl) return 'ERR: Child not found';
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

    // 3. Set left side duration
    if (LEFT_MINUTES > 0) {
      const leftInput = document.getElementById('left_side');
      if (leftInput) {
        leftInput.value = LEFT_MINUTES.toString();
        leftInput.dispatchEvent(new Event('change', {bubbles: true}));
        leftInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 4. Set right side duration
    if (RIGHT_MINUTES > 0) {
      const rightInput = document.getElementById('right_side');
      if (rightInput) {
        rightInput.value = RIGHT_MINUTES.toString();
        rightInput.dispatchEvent(new Event('change', {bubbles: true}));
        rightInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 5. Set last side
    const lastRadio = document.getElementById(LAST_SIDE === 'left' ? 'last_left' : 'last_right');
    if (lastRadio) lastRadio.click();

    // 6. Optional notes
    if (NOTES) {
      const notesInput = document.querySelector('textarea, input[name*="note"], #notes');
      if (notesInput) {
        notesInput.value = NOTES;
        notesInput.dispatchEvent(new Event('change', {bubbles: true}));
        notesInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 7. Save
    for (const btn of document.querySelectorAll('button')) {
      if (btn.innerText?.includes('Save') && !btn.disabled) {
        btn.click();
        return 'OK: Saved nursing - ' + LEFT_MINUTES + 'm left, ' + RIGHT_MINUTES + 'm right';
      }
    }
    return 'ERR: Save button not found or disabled';
  } catch (e) {
    return 'ERR: ' + e.message;
  }
})()
