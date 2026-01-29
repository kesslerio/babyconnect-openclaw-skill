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

| Field | Selector | Notes |
|-------|----------|-------|
| Start time | `#timeinput` | Format: `10:02PM` |
| End time | `#endtimeinput` | Format: `10:12PM` |
| Duration (mins) | `#mduration` | Integer |
| Quantity | `#bibsize input` | **NOT** `#idQty` |
| Unit display | `#bibunit` | Span - verify after setting |
| Unit value | `_uinfo.DUnit` | 0=oz, 1=ml |
| Milk type | `#bibMilk` | Radio button |
| Formula type | `#bibFormula` | Radio button |

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
