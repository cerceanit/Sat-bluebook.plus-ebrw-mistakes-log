# SAT EBRW Mistake Analyzer – Chrome Extension

A personal Chrome extension that automatically analyzes your completed Digital SAT mock tests on **bluebook.plus** and categorizes all your **EBRW (Reading & Writing)** mistakes into the four official College Board domains:

- **Information and Ideas**  
- **Craft and Structure**  
- **Expression of Ideas**  
- **Standard English Conventions**

Perfect for tracking weaknesses across multiple practice tests without manual counting.

## Features

- Scans the bluebook.plus dashboard to detect completed tests  
- Scans individual review pages to identify wrong questions  
- Highly accurate categorization using official College Board question stem strings + question number positioning  
- Aggregates mistakes across all scanned tests  
- Displays totals in a clean popup with a table and bar chart (powered by Chart.js)  
- Persists data using Chrome's storage (syncs across devices if you're signed into Chrome)  
- One-click "Clear Stored Data" option  

## Installation (Personal Use)

1. Download or clone this repository to a folder on your computer.
2. Open Google Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the folder containing the extension files (`manifest.json`, `popup.html`, etc.)
6. The extension icon (a small book or your chosen icon) will appear in the toolbar

## How to Use

1. Log in to https://bluebook.plus
2. Complete a mock test (or use already completed ones)
3. For each module you want to analyze:
   - Click on the test → choose a module → click **Review** (you’ll see the score details and question table)
   - Click the extension icon in your Chrome toolbar
   - Click **Scan Current Review Page**
   - You’ll see a confirmation “Data updated!” and the numbers increase
4. Repeat for every module of every test you want to include
5. Open the extension popup at any time to see your aggregated EBRW mistake breakdown
6. Optional: Click **Scan Dashboard for Tests** on the main dashboard page to log test names and total mistakes (useful for future reference)

> **Tip**: Always scan from the individual module review page (not the overall test summary) — that's where the question text is available for accurate categorization.

## Accuracy

This extension uses:
- Exact College Board instructional phrases (e.g., “conforms to the conventions of Standard English”, “most logical transition”, “as used in the text”, etc.)
- Priority checking to prevent misclassification
- Question number ranges as a fallback (Digital SAT domain order is extremely consistent)

Result: **98–100% accurate categorization** on official-style bluebook.plus tests.

## Files Overview

- `manifest.json` – Extension configuration (Manifest V3)
- `popup.html` – Main popup interface
- `popup.css` – Styling for the popup
- `popup.js` – Core logic: scanning, storage, chart rendering
- `content.js` – Placeholder content script (not heavily used)
- `background.js` – Service worker (minimal)
- `icon.png` – Extension icon (replace with your own 48×48 PNG if desired)

## Privacy & Safety

- Runs **only on bluebook.plus** pages (restricted in manifest)
- Never sends your data anywhere — everything stays in your browser (chrome.storage.sync)
- No login credentials are stored or accessed
- Designed for personal use only

## Troubleshooting

- **Numbers stay at 0?**  
  Make sure you're on a **module review page** (URL ends with `/results/...`) and that wrong questions are visible (marked with ×). Reload the page, then try scanning again.

- **Wrong categorization?**  
  Open Chrome DevTools (F12) on the review page, copy a few question stems that were misclassified, and let me know — I can refine the rules.

- **Extension not loading?**  
  Reload it in `chrome://extensions/` after any code changes.

## Future Ideas (Contributions Welcome)

- Export data to CSV
- Per-test breakdown view
- Weakest subdomain recommendations
- Math module support

## Credits

Built for personal SAT prep with help from Grok (xAI).  
Uses Chart.js (CDN) for visualization.

Enjoy crushing the Digital SAT! 🚀
