// Sleep Entry Snippet
// Prerequisites: Dialog opened with showSleepDlg(), waited 1.5s

(async () => {
  try {
    // === PARAMETERS ===
    const CHILD_ID = '4744184165629952';  // Quinn
    const START_TIME = '';  // Empty = current time, or '10:00PM'
    const END_TIME = '';    // Empty = still sleeping (ongoing)
    const NOTES = '';  // Optional notes
    // === END PARAMETERS ===

    await new Promise(r => setTimeout(r, 1500));

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

    // 3. Set end time if specified (leave empty for ongoing sleep)
    if (END_TIME) {
      const endInput = document.getElementById('endtimeinput');
      if (endInput) {
        endInput.value = END_TIME;
        endInput.dispatchEvent(new Event('change', {bubbles: true}));
        endInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 4. Optional notes
    if (NOTES) {
      const notesInput = document.querySelector('textarea, input[name*="note"], #notes');
      if (notesInput) {
        notesInput.value = NOTES;
        notesInput.dispatchEvent(new Event('change', {bubbles: true}));
        notesInput.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }

    // 5. Save
    for (const btn of document.querySelectorAll('button')) {
      if (btn.innerText?.includes('Save') && !btn.disabled) {
        btn.click();
        const status = END_TIME ? 'completed' : 'ongoing';
        return 'OK: Saved sleep entry (' + status + ')';
      }
    }
    return 'ERR: Save button not found or disabled';
  } catch (e) {
    return 'ERR: ' + e.message;
  }
})()
