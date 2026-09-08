# 🌍 Köppen Climate Zone Guessr

A GeoGuessr-inspired geography and climatology game that drops you into a mystery Google Street View location anywhere on Earth and challenges you to deduce its **Köppen climate classification**.

🎮 **Play Online**: [https://vadim0x60.github.io/koppengame/](https://vadim0x60.github.io/koppengame/)

## ✨ Features

- **Interactive 360° Street View**: Look around, pan, zoom, and inspect flora, soil, topography, sunlight angle, and architecture.
- **Player-made Shortlists**: Select every climate type you think is plausible, then submit the set. An exact answer earns 1 point; a shortlist containing the answer earns `1 ÷ choices` points.
- **Full Educational Explanations**: Detailed breakdown after each guess showing why that region has that specific Köppen code (temperature thresholds, rainfall seasonality, ocean currents, rain shadows).
- **In-Game Reference Guide**: A built-in modal with quick summaries of the entire Köppen classification scheme.
- **Stats & Streaks**: Tracks rounds, current streak, high streak, and overall accuracy.
- **Zero Configuration Required**: Works out-of-the-box in any modern browser. Supports an optional custom Google Maps API key if you want to use the official Maps Embed API.
- **Rural-biased Location Pool**: The [built-up-land pilot](../sampling/README.md) selects 1,099 of 2,628 source sites, reducing the geographic urban proxy from 56% to 24% while retaining every represented climate × country combination. The full source pool is preserved; panorama coordinates and environmental visibility still need scene review.

## 🚀 How to Run

1. From the repository root, start the shared local server:
   ```bash
   python3 server.py
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

The root page redirects to `game/`. If your shell is already in `game/`, run
`python3 ../server.py` instead. Run the legacy data-generation and API diagnostic
scripts from `game/` so their relative JSON paths continue to work; these are
networked/manual tools, not offline tests.

Enjoy testing your geography and climate knowledge!
