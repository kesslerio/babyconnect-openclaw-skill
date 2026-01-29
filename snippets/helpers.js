// Baby Connect Helper Functions
// Load these first, then use in workflow snippets

// Standard Return Format: All snippets return "OK: ..." or "ERR: ..."

// Wait for element with polling (use instead of fixed setTimeout)
const waitFor = (selector, timeoutMs = 5000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - start > timeoutMs) return reject('Timeout: ' + selector);
      setTimeout(check, 100);
    };
    check();
  });
};

// Validate dialog has required elements before filling
const validateDialog = (requiredSelectors) => {
  const missing = requiredSelectors.filter(s => !document.querySelector(s));
  if (missing.length > 0) {
    return { ok: false, error: 'Missing elements: ' + missing.join(', ') };
  }
  return { ok: true };
};

// Check if logged in
const checkSession = () => {
  if (document.querySelector('#username') || document.querySelector('#password')) {
    return { ok: false, error: 'Session expired - login required' };
  }
  if (document.querySelector('.st') || document.querySelector('[id^="dlgKid-"]')) {
    return { ok: true };
  }
  return { ok: false, error: 'Unknown page state' };
};

// Select child by ID
const selectChild = (childId) => {
  const el = document.getElementById('dlgKid-' + childId);
  if (!el) return { ok: false, error: 'Child not found: ' + childId };
  el.click();
  return { ok: true };
};

// Set input value with events
const setInput = (selector, value) => {
  const input = document.querySelector(selector);
  if (!input) return { ok: false, error: 'Input not found: ' + selector };
  input.value = value;
  input.dispatchEvent(new Event('change', {bubbles: true}));
  input.dispatchEvent(new Event('input', {bubbles: true}));
  return { ok: true };
};

// Click Save button
const clickSave = () => {
  for (const btn of document.querySelectorAll('button')) {
    if (btn.innerText?.includes('Save') && !btn.disabled) {
      btn.click();
      return { ok: true };
    }
  }
  return { ok: false, error: 'Save button not found or disabled' };
};

// Get latest feed entries
const getLatestEntries = (limit = 10) => {
  const entries = document.querySelectorAll('.st');
  const results = [];
  for (let i = 0; i < Math.min(entries.length, limit); i++) {
    const entry = entries[i];
    const title = entry.querySelector('.st_tl')?.innerText || '';
    const time = entry.querySelector('.st_dsc')?.innerText?.split('\n')[0] || '';
    if (title) results.push({ title, time });
  }
  return results;
};
