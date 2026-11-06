// ACSNN web app: calculator, plot, downloads and data-driven page content.
(function () {
  "use strict";

  const model = ACSNNModel.createModel(window.ACSNN_WEIGHTS);
  const EXP = window.ACSNN_EXP_DATA || [];
  const V = window.ACSNNViews;
  const t_ = I18N.t;
  const $ = (id) => document.getElementById(id);

  // ---- Constants ----
  const COLORS = {
    blue: "#4C78A8", orange: "#F58518", green: "#54A24B", red: "#E45756",
    purple: "#B279A2", brown: "#9D755D", teal: "#72B7B2", gray: "#7f7f7f"
  };
  const DEFAULT_COLOR = { "CDW-EIS": "blue", "CTMC": "orange", "Semiempiric_1985Rudd": "green" };
  const EXTRA_COLORS = ["red", "purple", "brown", "teal", "gray"];
  const DASHES = ["solid", "dash", "dot", "dashdot"]; // Plotly dash values; labels: "dash.<value>"
  const SHORT = { "CDW-EIS": "CDW-EIS", "CTMC": "CTMC", "Semiempiric_1985Rudd": "Rudd" };
  const UNITS = {
    cm2: { factor: 1.0, plotly: "cm<sup>2</sup>", csv: "cm^2" },
    m2: { factor: 1e-4, plotly: "m<sup>2</sup>", csv: "m^2" },
    Mb: { factor: 1e18, plotly: "Mb", csv: "Mb" },
    a02: { factor: 1 / 2.8002852e-17, plotly: "a<sub>0</sub><sup>2</sup>", csv: "a0^2" } // 1 a0^2 = 2.8002852e-17 cm^2
  };
  const STYLES = {
    clean: { paper: "#ffffff", plot: "#ffffff",
      axis: { showgrid: true, gridcolor: "#eef1f6", zeroline: false, showline: true, linecolor: "#5b6475", mirror: true, ticks: "outside", tickcolor: "#5b6475" } },
    journal: { paper: "#ffffff", plot: "#ffffff",
      axis: { showgrid: false, zeroline: false, showline: true, linecolor: "#000000", mirror: true, ticks: "inside", tickcolor: "#000000" } },
    plotly: { paper: "#ffffff", plot: "#E5ECF6",
      axis: { showgrid: true, gridcolor: "#ffffff", zeroline: false, showline: false, ticks: "" } }
  };
  const EXP_SOURCES = V.expSources(EXP);
  const SRC_NAMES = EXP_SOURCES.map((s) => s.src);

  const state = { curves: [], theory: "CDW-EIS" }; // curves: {func, zp, dash, color}

  // ---- Helpers ----
  function logspace(a, b, n) {
    const la = Math.log10(a), lb = Math.log10(b), out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = Math.pow(10, n === 1 ? la : la + (lb - la) * i / (n - 1));
    return out;
  }
  function linspace(a, b, n) {
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = n === 1 ? a : a + (b - a) * i / (n - 1);
    return out;
  }
  function grid(a, b, n, xscale) { return xscale === "log" ? logspace(a, b, n) : linspace(a, b, n); }
  function segValue(id) { return $(id).querySelector('[aria-pressed="true"]').dataset.v; }
  function clampNum(el, lo, hi, fallback) {
    let v = parseFloat(el.value);
    if (!isFinite(v)) v = fallback;
    return Math.min(hi, Math.max(lo, v));
  }
  let toastTimer = null;
  function toast(msg, isError) {
    const el = $("toast");
    el.textContent = msg;
    el.className = "show" + (isError ? " error" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = ""; }, 3500);
  }
  function settings() {
    return {
      emin: parseFloat($("emin").value), emax: parseFloat($("emax").value),
      npts: parseInt($("npts").value, 10), xscale: segValue("xscale-seg"), yscale: segValue("yscale-seg"),
      unit: $("unit").value, style: $("style").value, legend: $("legend").value,
      height: clampNum($("height"), 300, 1200, 520),
      showExp: $("show-exp").checked, showBounds: $("show-bounds").checked
    };
  }
  function rangeError(s) {
    if (!(s.emin > 0) || !(s.emax > 0)) return t_("msg.rangePositive");
    if (s.emin >= s.emax) return t_("msg.rangeOrder");
    return null;
  }
  const curveName = (c) => `${SHORT[c.func]}, Z<sub>P</sub>=${c.zp}`;

  // ---- Toolbar ----
  function setSeg(id, value) {
    $(id).querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === value)));
  }
  function refreshZp() {
    const max = model.zpMax(state.theory), zp = $("zp");
    zp.max = String(max);
    if (+zp.value > max) zp.value = String(max);
    $("zp-val").textContent = zp.value;
    $("zp-hint").innerHTML = t_(max === 1 ? "calc.zpHintRudd" : "calc.zpHint");
  }
  $("theory-seg").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    state.theory = b.dataset.v;
    setSeg("theory-seg", state.theory);
    refreshZp();
  }));
  $("zp").addEventListener("input", () => { $("zp-val").textContent = $("zp").value; });

  $("add").onclick = () => {
    const err = rangeError(settings());
    if (err) { toast(err, true); return; }
    const func = state.theory, zp = +$("zp").value;
    if (zp > model.zpMax(func)) { toast(t_("msg.zpMax", { func: SHORT[func], max: model.zpMax(func) }), true); return; }
    if (state.curves.some((c) => c.func === func && c.zp === zp)) { toast(t_("msg.duplicate", { func: SHORT[func], zp: zp })); return; }
    const used = state.curves.map((c) => c.color);
    let color = DEFAULT_COLOR[func];
    // Blue/orange/green identify the theories (cards, range bars): extra curves take the other colors.
    if (used.includes(color)) color = EXTRA_COLORS.find((k) => !used.includes(k)) || color;
    state.curves.push({ func, zp, dash: "solid", color });
    toast(t_("msg.added", { func: SHORT[func], zp: zp }));
    update();
  };
  $("clear").onclick = () => {
    state.curves.length = 0;
    warnedNoExp = new Set();
    toast(t_("msg.cleared"));
    update();
  };

  // ---- Chips ----
  function makeSelect(options, labelPrefix, value, title, onChange) {
    const sel = document.createElement("select");
    sel.title = title; sel.setAttribute("aria-label", title);
    options.forEach((o) => sel.add(new Option(t_(labelPrefix + o), o, false, o === value)));
    sel.onchange = () => onChange(sel.value);
    return sel;
  }
  function renderChips() {
    const box = $("chips");
    box.replaceChildren();
    $("clear").disabled = state.curves.length === 0;
    if (!state.curves.length) {
      const p = document.createElement("p");
      p.className = "empty"; p.textContent = t_("calc.noCurves");
      box.appendChild(p);
      return;
    }
    state.curves.forEach((c, i) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.style.setProperty("--c", COLORS[c.color]);
      const name = document.createElement("span");
      name.className = "name"; name.innerHTML = curveName(c).replace(", ", " · ");
      const rm = document.createElement("button");
      rm.type = "button"; rm.className = "x"; rm.textContent = "✕";
      rm.setAttribute("aria-label", t_("chip.remove", { name: SHORT[c.func] + " Z_P=" + c.zp }));
      rm.onclick = () => { state.curves.splice(i, 1); update(); };
      chip.append(name,
        makeSelect(DASHES, "dash.", c.dash, t_("chip.style"), (v) => { c.dash = v; update(); }),
        makeSelect(Object.keys(COLORS), "color.", c.color, t_("chip.color"), (v) => { c.color = v; update(); }),
        rm);
      box.appendChild(chip);
    });
  }

  // ---- Plot ----
  let warnedNoExp = new Set();
  let lastNote = ""; // info toast shown for the current situation (not repeated on unrelated changes)
  function renderPlot() {
    const s = settings();
    const has = state.curves.length > 0;
    $("placeholder").hidden = has;
    $("figure").hidden = !has;
    if (!has) { if ($("plot").data) Plotly.purge("plot"); return; }
    const err = rangeError(s);
    if (err) {
      toast(err, true);
      // Keep the last valid plot, but drop curves the user has removed meanwhile.
      const gd = $("plot");
      if (gd.data) {
        const names = new Set(state.curves.map(curveName)), groups = new Set(state.curves.map((c) => "exp-" + c.zp));
        const keep = gd.data.filter((t) => (t.mode === "lines" ? names.has(t.name) : groups.has(t.legendgroup)));
        if (keep.length !== gd.data.length) Plotly.react(gd, keep, gd.layout);
      }
      return;
    }

    const unit = UNITS[s.unit];
    const traces = [], shapes = [], outside = [], notes = [];
    // Like the Python GUI: each curve is evaluated only inside its training energy range.
    state.curves.forEach((c) => {
      const [tlo, thi] = model.trainRange(c.func);
      if (s.showBounds) [tlo, thi].forEach((b) => {
        if (s.emin < b && b < s.emax) shapes.push({ type: "line", xref: "x", yref: "paper", x0: b, x1: b, y0: 0, y1: 1,
          line: { color: COLORS[c.color], width: 1.2, dash: "dot" }, opacity: 0.55 });
      });
      const lo = Math.max(s.emin, tlo), hi = Math.min(s.emax, thi);
      if (!(lo < hi)) { outside.push(SHORT[c.func]); return; }
      const xs = grid(lo, hi, s.npts, s.xscale);
      const ys = model.predict(c.func, c.zp, xs);
      const keep = ys.map((v) => !isNaN(v));
      traces.push({
        x: xs.filter((_, i) => keep[i]),
        y: ys.filter((_, i) => keep[i]).map((v) => v * unit.factor),
        mode: "lines",
        line: { color: COLORS[c.color], dash: c.dash, width: 2.5 },
        name: curveName(c),
        hovertemplate: "E = %{x:.4g} keV/u<br>σ = %{y:.4e}<extra>%{fullData.name}</extra>"
      });
    });
    // "Outside the training range" is shown once per situation, not again on unrelated changes (unit, color...)
    const outsideNote = outside.length ? t_("msg.outsideTraining", { list: [...new Set(outside)].join(", ") }) : "";
    if (outsideNote && outsideNote !== lastNote) notes.push(outsideNote);
    lastNote = outsideNote;

    if (s.showExp) {
      [...new Set(state.curves.map((c) => c.zp))].sort((a, b) => a - b).forEach((zp) => {
        const rows = EXP.filter((r) => r.zp === zp && r.zt === 1 && r.e >= s.emin && r.e <= s.emax);
        if (!rows.length) {
          if (!warnedNoExp.has(zp)) { notes.push(t_("msg.noExp", { zp: zp })); warnedNoExp.add(zp); }
          return;
        }
        const color = V.zpColor(zp);
        EXP_SOURCES.filter((src) => rows.some((r) => r.src === src.src)).forEach((src) => {
          const sr = rows.filter((r) => r.src === src.src);
          const cs = sr.map((r) => r.cs * unit.factor);
          traces.push({
            x: sr.map((r) => r.e), y: cs, mode: "markers", name: src.label,
            marker: { color: color, symbol: V.markerSymbol(src.src, SRC_NAMES), size: 8, line: { color: "#ffffff", width: 1 } },
            error_y: { type: "data", array: sr.map((r, k) => r.unc / 100 * cs[k]), visible: true, thickness: 1, color: color },
            legendgroup: "exp-" + zp,
            legendgrouptitle: { text: t_("plot.expGroup", { zp: zp }), font: { size: 12 } },
            customdata: sr.map((r) => r.doi),
            hovertemplate: "E = %{x:.4g} keV/u<br>σ = %{y:.4e}<br>%{customdata}<extra>" + src.label + "</extra>"
          });
        });
      });
    }

    if (notes.length) toast(notes.join(" ")); // one toast, so no message hides another

    const st = STYLES[s.style];
    const axis = (title, type) => Object.assign({ type: type, title: { text: title, font: { size: 15 } },
      tickfont: { size: 13 }, automargin: true, exponentformat: "power" }, st.axis);
    const legend = { font: { size: 12 }, bgcolor: "rgba(255,255,255,0.8)", groupclick: "toggleitem" };
    if (s.legend === "outside") Object.assign(legend, { x: 1.02, y: 1, xanchor: "left", yanchor: "top" });
    else if (s.legend === "below") Object.assign(legend, { orientation: "h", x: 0, y: -0.22, xanchor: "left", yanchor: "top" });
    else Object.assign(legend, { x: 0.99, y: 0.99, xanchor: "right", yanchor: "top" });

    Plotly.react("plot", traces, {
      xaxis: axis(t_("plot.xaxis"), s.xscale),
      yaxis: Object.assign(axis(t_("plot.yaxis", { unit: unit.plotly }), s.yscale), { title: { text: t_("plot.yaxis", { unit: unit.plotly }), standoff: 18, font: { size: 15 } } }),
      legend: legend, showlegend: true, shapes: shapes,
      paper_bgcolor: st.paper, plot_bgcolor: st.plot,
      height: s.height, autosize: true, margin: { t: 20, r: 20, b: 60, l: 80 },
      font: { family: "Source Sans 3, Source Sans Pro, system-ui, Helvetica, Arial, sans-serif", color: "#1d2433", size: 14 }
    }, {
      responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"],
      locale: I18N.lang(), // modebar texts (plotly-locale-es.js registers Spanish texts only, keeps the decimal point)
      toImageButtonOptions: { filename: "acsnn_cross_sections", scale: 2 }
    });
  }

  function update() { renderChips(); renderPlot(); }

  // ---- CSV ----
  function csvText() {
    const s = settings();
    const unit = UNITS[s.unit];
    const x = grid(s.emin, s.emax, s.npts, s.xscale);
    const cols = state.curves.map((c) => model.predict(c.func, c.zp, x).map((v) => v * unit.factor));
    const funcs = [...new Set(state.curves.map((c) => c.func))];
    const ranges = funcs.map((f) => `${f}: [${model.trainRange(f).join(", ")}] keV/u`).join("; ");
    const lines = [
      `# ACSNN Calculator v${model.version}, target: atomic hydrogen (Zt = 1)`,
      `# Training ranges: ${ranges}`,
      "# Empty value = outside training range (extrapolation unreliable)",
      ["E[keV/u]"].concat(state.curves.map((c) => `TCS_${c.func}_Zp${c.zp}_Zt1[${unit.csv}]`)).join(",")
    ];
    x.forEach((e, i) => lines.push([e.toPrecision(10)].concat(cols.map((col) => (isNaN(col[i]) ? "" : col[i].toPrecision(10)))).join(",")));
    return lines.join("\n") + "\n";
  }

  // ---- Downloads ----
  function download(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function plotSize() { const fl = $("plot")._fullLayout; return [Math.round(fl.width), Math.round(fl.height)]; }
  function saveImage(format) {
    const [w, h] = plotSize();
    Plotly.downloadImage($("plot"), { format: format, filename: "acsnn_cross_sections", width: w, height: h, scale: format === "svg" ? 1 : 2 });
  }
  // svg2pdf.js uses the standard PDF fonts (WinAnsi), which lack U+2212 (minus) and U+200B
  // (zero-width space), and it does not resolve relative units in Plotly's superscript tspans.
  function normalizeSvgForPdf(svgEl) {
    svgEl.querySelectorAll("text").forEach((text) => {
      const base = parseFloat(text.style.fontSize) || 12;
      text.querySelectorAll("tspan").forEach((ts) => {
        const fs = ts.style.fontSize;
        const size = fs && fs.endsWith("%") ? base * parseFloat(fs) / 100 : (parseFloat(fs) || base);
        if (fs && fs.endsWith("%")) ts.style.fontSize = size + "px";
        ["dy", "dx"].forEach((attr) => {
          const v = ts.getAttribute(attr);
          if (v && v.endsWith("em")) ts.setAttribute(attr, (parseFloat(v) * size) + "px");
        });
      });
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        n.nodeValue = n.nodeValue.replace(/​/g, "").replace(/−/g, "-");
      }
      // Plotly returns to the baseline after a sub/superscript with a tspan that only holds a zero-width
      // space; once emptied, svg2pdf skips it and its dy is lost. Carry that dy over to the following text.
      [...text.querySelectorAll("tspan")].forEach((ts) => {
        const dy = parseFloat(ts.getAttribute("dy") || "0");
        if (ts.textContent !== "" || !dy) return;
        let next = ts.nextSibling;
        while (next && next.nodeType === 3 && next.nodeValue === "") next = next.nextSibling;
        if (next && next.nodeType === 3) {
          const wrap = document.createElementNS(ts.namespaceURI, "tspan");
          wrap.setAttribute("dy", dy + "px");
          text.insertBefore(wrap, next);
          wrap.appendChild(next);
        } else if (next && next.nodeName === "tspan") {
          next.setAttribute("dy", (parseFloat(next.getAttribute("dy") || "0") + dy) + "px");
        }
        ts.remove();
      });
      // The PDF uses Helvetica; measure with a metric-compatible font so positions match.
      text.style.fontFamily = "Helvetica, Arial, 'Liberation Sans', sans-serif";
      // svg2pdf anchors each tspan chunk separately: turn centered/right-aligned
      // multi-part labels (e.g. "10^-16", "cm^2") into left-aligned ones at the right offset.
      const anchor = text.getAttribute("text-anchor");
      if (text.querySelector("tspan") && (anchor === "middle" || anchor === "end")) {
        const width = text.getComputedTextLength();
        const x = parseFloat(text.getAttribute("x")) || 0;
        text.setAttribute("x", x - (anchor === "middle" ? width / 2 : width));
        text.setAttribute("text-anchor", "start");
      }
    });
  }
  // Vector PDF: Plotly SVG -> jsPDF via svg2pdf.js; falls back to an embedded high-res PNG.
  async function savePdf() {
    const gd = $("plot");
    const [w, h] = plotSize();
    const btn = $("dl-pdf");
    btn.disabled = true;
    try {
      const doc = new window.jspdf.jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "pt", format: [w, h] });
      try {
        const url = await Plotly.toImage(gd, { format: "svg", width: w, height: h });
        const svgText = decodeURIComponent(url.slice(url.indexOf(",") + 1));
        const svgEl = new DOMParser().parseFromString(svgText, "image/svg+xml").documentElement;
        const holder = document.createElement("div");
        holder.style.cssText = "position:absolute;left:-10000px;top:0;";
        holder.appendChild(svgEl);
        document.body.appendChild(holder);
        normalizeSvgForPdf(svgEl);
        try { await doc.svg(svgEl, { x: 0, y: 0, width: w, height: h }); }
        finally { holder.remove(); }
      } catch (vecErr) {
        console.warn("Vector PDF failed, using raster fallback:", vecErr);
        const png = await Plotly.toImage(gd, { format: "png", width: w, height: h, scale: 3 });
        doc.addImage(png, "PNG", 0, 0, w, h);
      }
      doc.save("acsnn_cross_sections.pdf");
    } catch (e) {
      toast(t_("msg.pdfError", { err: e.message }), true);
    } finally {
      btn.disabled = false;
    }
  }
  $("dl-pdf").onclick = savePdf;
  $("dl-png").onclick = () => saveImage("png");
  $("dl-svg").onclick = () => saveImage("svg");
  $("dl-csv").onclick = () => {
    const err = rangeError(settings());
    if (err) { toast(err, true); return; }
    download(new Blob([csvText()], { type: "text/csv" }), "acsnn_cross_sections.csv");
  };

  // ---- Appearance drawer ----
  function setDrawer(open) {
    const drawer = $("drawer"), wasInside = drawer.contains(document.activeElement);
    drawer.classList.toggle("open", open);
    $("gear").setAttribute("aria-expanded", String(open));
    if (open) $("drawer-close").focus();
    else if (wasInside) $("gear").focus(); // focus must not stay on a hidden element
  }
  $("gear").onclick = () => setDrawer(!$("drawer").classList.contains("open"));
  $("drawer-close").onclick = () => setDrawer(false);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("drawer").classList.contains("open")) setDrawer(false); });
  ["xscale-seg", "yscale-seg"].forEach((id) => $(id).querySelectorAll("button").forEach((b) =>
    b.addEventListener("click", () => { setSeg(id, b.dataset.v); update(); })));
  $("npts").addEventListener("input", () => { $("npts-val").textContent = $("npts").value; });
  ["unit", "npts", "style", "legend", "height", "emin", "emax", "show-exp", "show-bounds"].forEach((id) =>
    $(id).addEventListener("change", update));

  // ---- Copy-citation buttons ----
  document.querySelectorAll("button.copy").forEach((btn) => {
    btn.onclick = async () => {
      const text = $(btn.dataset.copy).textContent;
      try { await navigator.clipboard.writeText(text); }
      catch (e) { // file:// or older browsers
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove();
      }
      toast(t_("msg.copied"));
    };
  });

  // ---- Content: training-range bars and experimental-data table ----
  const THEORY_COLOR = { "CDW-EIS": COLORS.blue, "CTMC": COLORS.orange, "Semiempiric_1985Rudd": COLORS.green };
  function renderRangeBars() {
    const X0 = 170, X1 = 960, W = X1 - X0, ROW = 38, TOP = 14;
    const bars = V.trainingBars(window.ACSNN_WEIGHTS, 1, 1e5);
    const H = TOP + ROW * bars.length + 46;
    const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let g = "";
    for (let k = 0; k <= 5; k++) {
      const x = X0 + W * k / 5;
      g += `<line x1="${x}" y1="${TOP - 6}" x2="${x}" y2="${TOP + ROW * bars.length}" stroke="#d9dee6"/>` +
        `<text x="${x}" y="${TOP + ROW * bars.length + 18}" font-size="13" fill="#5b6475" text-anchor="middle">${k === 0 ? "1" : k === 1 ? "10" : "10" + "⁰¹²³⁴⁵"[k]}</text>`;
    }
    bars.forEach((b, i) => {
      const y = TOP + ROW * i + 6, [lo, hi] = model.trainRange(b.theory);
      const zpNote = model.zpMax(b.theory) === 1 ? ' (Z<tspan baseline-shift="sub" font-size="11">P</tspan> = 1)' : "";
      g += `<text x="10" y="${y + 15}" font-size="15" fill="#1d2433">${esc(SHORT[b.theory])}${zpNote}</text>` +
        `<rect data-theory="${b.theory}" x="${(X0 + b.x0 * W).toFixed(2)}" y="${y}" width="${((b.x1 - b.x0) * W).toFixed(2)}" height="20" rx="10" fill="${THEORY_COLOR[b.theory]}">` +
        `<title>${esc(SHORT[b.theory])}: ${lo}–${hi} keV/u</title></rect>`;
    });
    g += `<text x="${X0 + W / 2}" y="${H - 4}" font-size="13" fill="#5b6475" text-anchor="middle">${esc(t_("th.axis"))}</text>`;
    $("range-bars").innerHTML = `<svg viewBox="0 0 1000 ${H}" data-axis-x0="${X0}" data-axis-x1="${X1}" role="img" aria-label="${esc(t_("th.ranges"))}">${g}</svg>`;
  }
  function renderDataTable() {
    const fmt = (v) => (v >= 100 ? Math.round(v) : +v.toPrecision(2)).toString();
    const tbody = $("data-table");
    tbody.replaceChildren();
    EXP_SOURCES.forEach((src) => {
      const m = src.label.match(/^(\d{4})\s+(.*)$/);
      const ref = m ? `${m[2]} (${m[1]})` : src.label;
      const tr = document.createElement("tr");
      const cells = [ref, src.zps.map(V.projectileLabel).join(", "), `${fmt(src.emin)} – ${fmt(src.emax)}`, String(src.n)];
      cells.forEach((txt, i) => { const td = document.createElement("td"); td.textContent = txt; if (i >= 2) td.className = "num"; tr.appendChild(td); });
      const td = document.createElement("td");
      if (src.doi) {
        const a = document.createElement("a");
        a.href = src.doi; a.target = "_blank"; a.rel = "noopener";
        a.textContent = src.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
        td.appendChild(a);
      }
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
  }

  // ---- Language ----
  document.querySelectorAll("[data-lang]").forEach((b) => { b.onclick = () => I18N.setLang(b.dataset.lang); });
  window.addEventListener("langchange", () => { refreshZp(); renderRangeBars(); update(); });
  I18N.apply();

  // On phones the legend would cover the data: start with it below the plot (user can change it).
  if (window.innerWidth < 600) $("legend").value = "below";

  window.ACSNNApp = { state: state, update: update, csvText: csvText, normalizeSvgForPdf: normalizeSvgForPdf };
  refreshZp();
  renderRangeBars();
  renderDataTable();
  update();
})();
