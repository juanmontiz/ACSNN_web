# ACSNN Web App — static HTML/JavaScript version

ACSNN (Atomic Collision Surrogate Neural Network): neural-network predictions of total
single-ionization cross sections of atomic hydrogen by bare-ion impact (CDW-EIS, CTMC, Rudd 1985
semiempirical). Everything runs in the visitor's browser — **no server-side software, no Python,
no database**. Same look & feel as the ion-track-mc page of the group (navy/amber family style).

## Deployment (for the webmaster)

Copy this folder to the web server, e.g. as `https://www.ifir-conicet.gov.ar/acsnn/`,
**except the `dev_tools/` subdirectory — do NOT upload `dev_tools/`** (developer scripts and
source data, not needed by the website). That's all.
Any static web server (Apache, nginx, IIS, institutional CMS file area) works.

To test locally: double-click `index.html`.

### Language
The page is bilingual (English / Spanish) with an ES/EN switch (flags) in the top-right corner.
The default language is Spanish (as in the ion-track-mc page); the visitor's last choice is remembered,
and links can force it with `?lang=en` or `?lang=es`
(e.g. `https://www.ifir-conicet.gov.ar/acsnn/?lang=es` from a Spanish page).
To change or add texts, edit `i18n.js` (every key must exist in both `en` and `es`).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page layout (entry point) |
| `styles.css` | Styles (family look & feel shared with ion-track-mc + ACSNN components) |
| `app.js` | Calculator, plot, downloads, data-driven content |
| `views.js` | Pure helpers: experimental-source table, marker symbols/colors, training-range bars |
| `i18n.js` | Interface texts in English and Spanish (ES/EN switch) |
| `acsnn_model.js` | Neural-network inference (JavaScript port of `model.py`) |
| `model_weights.js` | Trained network weights |
| `exp_data.js` | Experimental cross-section database (with DOIs) |
| `plotly.min.js` | Plotly.js 2.35.2 plotting library (MIT license) |
| `jspdf.umd.min.js` | jsPDF 2.5.2, PDF export (MIT license) |
| `svg2pdf.umd.min.js` | svg2pdf.js 2.2.4, vector PDF export (MIT license) |
| `plotly-locale-es.js` | Spanish texts for the Plotly toolbar (from plotly.js-locales 2.35.2, MIT; decimal point kept) |
| `dev_tools/` | **Developer tools — do NOT upload** |

All libraries are bundled locally, so no external CDN is needed.

## Updating the model or data (developers)

See `dev_tools/README.md`. In short:

```bash
cd dev_tools
python3 export_web_data.py && python3 verify_js_model.py
node check_i18n.js && node test_views.js && node test_i18n_default.js
python3 browser_test.py --lang en && python3 browser_test.py --lang es --width 390
```

## How to cite

If you use this software or its results, please cite:

> Monti, J. M., Quinto, M. A., & López, S. D. (2026). *ACSNN Calculator: Atomic Collision Surrogate Neural Network* (Version 1.0.0) [Computer software]. https://github.com/juanmontiz/ACSNN_Calculator

```bibtex
@software{Monti_ACSNN_Calculator_2026,
  author  = {Monti, Juan Manuel and Quinto, Michele Arcangelo and L{\'o}pez, Sebasti{\'a}n David},
  title   = {{ACSNN Calculator: Atomic Collision Surrogate Neural Network}},
  version = {1.0.0},
  year    = {2026},
  license = {MIT},
  url     = {https://github.com/juanmontiz/ACSNN_Calculator}
}
```

Source code: https://github.com/juanmontiz/ACSNN_Calculator (MIT license)

Contact: monti@ifir-conicet.gov.ar
