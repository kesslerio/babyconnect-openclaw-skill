# Baby Connect DOM Reference

## Children Registry (Kessler Family)

| Child | dlgKid ID | Default Unit |
|-------|-----------|--------------|
| Quinn Erika Kessler | `4744184165629952` | ml (newborn) |
| Logan Sophia Kessler | `5782731657707520` | oz |

**Find IDs:** `document.querySelectorAll('[id^="dlgKid-"]').forEach(d => console.log(d.id, d.innerText));`

---

## Feed Entry Structure

```
.st (entry container)
├── .st_img (category icon)
├── .st_body
│   └── .st_tl (entry title/description)
├── .st_dsc (timestamp, social icons)
└── .st_action_div
    ├── a.delete > img[src*="trash.svg"]
    └── a.edit > img[src*="edit.svg"]
```

---

## Bottle Dialog (`showBibDlg()`)

**CRITICAL:** `_uinfo.DUnit` must be set BEFORE opening the dialog.
The dialog reads it at creation time to build dropdowns and unit labels.
Setting it after dialog open has NO effect on save.

| Field | Selector | Notes |
|-------|----------|-------|
| Start time | `#timeinput` | Format: `10:02PM` |
| End time | `#endtimeinput` | Format: `10:12PM` |
| Duration (mins) | `#mduration` | Integer |
| Quantity | `#bibsize input` | **NOT** `#idQty` |
| Unit display | `#bibunit` | Span — read-only indicator, no toggle handler |
| Unit control | `_uinfo.DUnit` | 0=oz, 1=ml — SET BEFORE dialog open |
| Milk type | `input[name="type"][value="Milk"]` | Radio button |
| Formula type | `input[name="type"][value="Formula"]` | Radio button |
| Water type | `input[name="type"][value="Water"]` | Radio button |
| Juice type | `input[name="type"][value="Juice"]` | Radio button |
| Summary | `#txt` | Auto-generated, disabled by default |

---

## Nursing Dialog (`showNursingDlg()`)

| Field | Selector |
|-------|----------|
| Left side (mins) | `#left_side` |
| Right side (mins) | `#right_side` |
| Last side: Left | `#last_left` (radio) |
| Last side: Right | `#last_right` (radio) |

---

## Diaper Dialog (`showDiaperDlg()`)

| Type | Click text |
|------|------------|
| Bowel movement only | `BM` |
| Poopy and wet | `BM + Wet` |
| Wet only | `Wet` |
| Dry | `Dry` |

**Sizes:** `Small`, `Medium`, `Large` (select dropdown)

**Checkboxes:** Diaper Cream, Leak, Open-Air Accident

---

## Weight Dialog (`showWeightDlg()`)

**PREREQUISITE:** Must select a child tab first. Crashes on "All Children" tab
(`Cannot read properties of undefined (reading 'Name')`).

| Field | Selector | Notes |
|-------|----------|-------|
| Unit: lbs | `input[name="unit"][value="1"]` | Radio, checked when DUnit=0 |
| Unit: lbs/oz | `input[name="unit"][value="2"]` | Radio |
| Unit: kg | `input[name="unit"][value="3"]` | Radio, checked when DUnit=1 |
| Weight whole | 1st `<select>` in `#post_dlg_c` | Options: 0-200 |
| Weight decimal | 2nd `<select>` in `#post_dlg_c` | Options: 0-9 (tenths) |
| Weight oz | 2nd `<select>` (lbs_oz mode) | Options: 0-15 |

Clicking unit radio triggers `initWeightWheels()` which rebuilds the dropdowns.
All weights stored internally as oz via `getWeightInOz()`.

---

## Sleep Dialog (`showSleepDlg()`)

| Field | Selector |
|-------|----------|
| Start time | `#timeinput` |
| End time | `#endtimeinput` |

Leave end time empty for ongoing sleep.

---

## Time Format

- 12-hour with AM/PM: `10:02PM`, `9:30AM`
- No space between time and AM/PM
- No leading zero: `9:30AM` not `09:30AM`
- Empty = current time

---

## All Dialog Functions

```javascript
// Core (documented)
showBibDlg()        // Bottle
showNursingDlg()    // Nursing
showDiaperDlg()     // Diaper
showSleepDlg()      // Sleep

// Additional (use at own risk)
showPumpingDlg()    // Pumping
showCupDlg()        // Cup feeding
showBathDlg()       // Bath
showMedicineDlg()   // Medicine
showTempDlg()       // Temperature
showWeightDlg()     // Weight
showMoodDlg()       // Mood
showPottyDlg()      // Potty training
showHealthDlg()     // Health notes
showMilestoneDlg()  // Milestones
```
