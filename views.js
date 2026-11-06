// ACSNN web app: pure helpers for data-driven content (no DOM access; tested in dev_tools/test_views.js).
(function (root) {
  "use strict";

  const SYMBOLS = ["circle", "square", "diamond", "triangle-up", "triangle-down", "star", "pentagon", "hexagon", "cross", "x"];
  // Dark tones per projectile charge, distinct from the theory colors (#4C78A8, #F58518, #54A24B).
  const ZP_COLORS = ["#2e3a4f", "#5b2a86", "#7a3b12", "#0f5b52", "#6b1f3a", "#3d4a12", "#1f3f7a", "#5a4a00", "#4a2f2f"];

  const label = (src) => src.replace(/^Exp_/, "");

  // Group experimental rows ({zp, zt, e, cs, unc, src, doi}) by source, sorted by label.
  function expSources(rows) {
    const m = new Map();
    rows.forEach((r) => {
      let s = m.get(r.src);
      if (!s) { s = { src: r.src, label: label(r.src), doi: r.doi || "", zps: [], emin: Infinity, emax: -Infinity, n: 0 }; m.set(r.src, s); }
      if (!s.zps.includes(r.zp)) s.zps.push(r.zp);
      s.emin = Math.min(s.emin, r.e); s.emax = Math.max(s.emax, r.e); s.n++;
    });
    const out = [...m.values()];
    out.forEach((s) => s.zps.sort((a, b) => a - b));
    return out.sort((a, b) => a.label.localeCompare(b.label));
  }

  // Marker symbol of a source: fixed by its position among all sources sorted by label.
  function markerSymbol(src, allSrcNames) {
    const sorted = [...allSrcNames].sort((a, b) => label(a).localeCompare(label(b)));
    const i = Math.max(0, sorted.indexOf(src));
    return SYMBOLS[i % SYMBOLS.length];
  }

  function zpColor(zp) { return ZP_COLORS[(zp - 1) % ZP_COLORS.length]; }

  function projectileLabel(zp) { return zp === 1 ? "H⁺" : zp === 2 ? "He²⁺" : "Z_P = " + zp; }

  // Training energy ranges as fractions [0,1] of a log10 axis [axisMin, axisMax].
  function trainingBars(weights, axisMin, axisMax) {
    const lo = Math.log10(axisMin || 1), hi = Math.log10(axisMax || 1e5);
    const f = (e) => Math.min(1, Math.max(0, (Math.log10(e) - lo) / (hi - lo)));
    return weights.theories.map((th) => ({ theory: th, x0: f(weights.train_e_min[th]), x1: f(weights.train_e_max[th]) }));
  }

  const api = { expSources, markerSymbol, zpColor, projectileLabel, trainingBars };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ACSNNViews = api;
})(this);
