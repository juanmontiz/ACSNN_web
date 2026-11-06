// ACSNN web app: user-interface translations (English / Spanish).
//
// Static page text:  <el data-i18n="key">       -> textContent
//                    <el data-i18n-html="key">  -> innerHTML (only for the trusted strings below)
// Dynamic text:      I18N.t("key", {var: value}) with {var} placeholders.
// Language: ?lang=es|en in the URL, else the last choice (localStorage), else Spanish.
// Changing language fires a "langchange" event on window (app.js re-renders on it).
(function (root) {
  "use strict";

  const STRINGS = {
    en: {
      "page.title": "ACSNN — Atomic Collision Surrogate Neural Network",
      "page.description": "Neural-network predictions of total single-ionization cross sections of atomic hydrogen by bare-ion impact (CDW-EIS, CTMC, Rudd semiempirical model).",
      "lang.label": "Language",

      "nav.label": "Sections", "nav.calc": "Calculator", "nav.theories": "Theories", "nav.network": "The network",
      "nav.data": "Experimental data", "nav.cite": "How to cite",

      "hero.kicker": "Neural-network surrogate · Open source",
      "hero.tagline": "Total cross sections for <strong>ionization of atomic hydrogen</strong> by bare-ion impact, from <strong>three theories</strong>, instantly and in your browser.",
      "hero.lede": "A single neural network reproduces CDW-EIS and CTMC calculations and the Rudd semiempirical model for projectile charges Z<sub>P</sub> = 1–9. Compare theories and measurements, and export the values for your simulation code (for example, a track-structure code).",
      "hero.toCalc": "Go to the calculator", "hero.github": "Source code on GitHub", "hero.cite": "How to cite",
      "fact.theories": "theories: CDW-EIS, CTMC, Rudd", "fact.zp": "bare ions on H",
      "fact.range": "training range", "fact.error": "network error vs. the theories", "fact.license": "license · nothing to install",

      "calc.eyebrow": "Calculator", "calc.title": "Compute and compare cross sections",
      "calc.theory": "Theory", "calc.zp": "Projectile charge Z<sub>P</sub>",
      "calc.zpHint": "Trained for Z<sub>P</sub> = 1–9 (CDW-EIS, CTMC).",
      "calc.zpHintRudd": "Rudd: protons only (Z<sub>P</sub> = 1).",
      "calc.target": "Target", "calc.targetValue": "H (Z<sub>T</sub> = 1)",
      "calc.energy": "Energy (keV/u)", "calc.emin": "Minimum energy (keV/u)", "calc.emax": "Maximum energy (keV/u)",
      "calc.add": "+ Add to plot", "calc.clear": "Clear all",
      "calc.showExp": "Experimental data", "calc.showBounds": "Training-range limits", "calc.appearance": "⚙ Appearance",
      "calc.note": "Dotted lines mark each theory's training range; outside it the curve is not drawn.",
      "calc.noCurves": "No curves on the plot yet.",

      "chip.style": "Line style", "chip.color": "Color", "chip.remove": "Remove {name}",
      "dash.solid": "solid", "dash.dash": "dashed", "dash.dot": "dotted", "dash.dashdot": "dash-dot",
      "color.blue": "blue", "color.orange": "orange", "color.green": "green", "color.red": "red", "color.purple": "purple",
      "color.brown": "brown", "color.teal": "teal", "color.gray": "gray",

      "drawer.title": "⚙ Plot appearance", "drawer.close": "Close", "drawer.axes": "Axes and units",
      "drawer.xscale": "X axis", "drawer.yscale": "Y axis", "drawer.linear": "linear", "drawer.units": "Units",
      "drawer.npts": "Points per curve", "drawer.styleHead": "Style", "drawer.style": "Plot style",
      "drawer.legend": "Legend", "drawer.height": "Plot height (px)",
      "drawer.live": "Changes apply immediately; each curve's color and line style are set in its chip.",
      "style.clean": "Clean", "style.journal": "Journal (black axes, no grid)", "style.plotly": "Plotly (light-blue background)",
      "legend.inside": "Inside (top right)", "legend.outside": "Outside (right)", "legend.below": "Below the plot",

      "plot.placeholder": "Choose a theory and a charge, then press “+ Add to plot”.",
      "plot.xaxis": "Projectile energy (keV/u)", "plot.yaxis": "Cross section ({unit})",
      "plot.expGroup": "Exp. Z<sub>P</sub> = {zp}",
      "dl.csv": "CSV (data)",

      "msg.rangePositive": "Energy range values must be positive.",
      "msg.rangeOrder": "Minimum energy must be less than maximum energy.",
      "msg.outsideTraining": "The energy range is outside the training range of: {list}",
      "msg.noExp": "No experimental data for Z_P = {zp} in this energy range.",
      "msg.zpMax": "{func} was trained only for Z_P ≤ {max}.",
      "msg.duplicate": "{func} with Z_P = {zp} is already on the plot.",
      "msg.added": "Added {func} (Z_P = {zp}) to the plot.",
      "msg.cleared": "All curves removed.",
      "msg.pdfError": "Could not create the PDF: {err}",
      "msg.copied": "Citation copied to the clipboard.",

      "th.eyebrow": "The theories", "th.title": "Three models, each in its own regime",
      "net.eyebrow": "The network", "net.title": "One network for three theories and nine charges",
      "data.eyebrow": "Experimental data", "data.title": "Measurements to compare with",
      "cite.eyebrow": "How to cite", "cite.title": "If you use these results",

      "th.intro": "No single theory is valid over the whole energy range. The network was trained on three complementary sources, and the theory is chosen as one more input: one network reproduces all three, and you choose which one to query.",
      "th.reliable": "Reliable", "th.trained": "Trained",
      "th.cdw.desc": "First-order quantum distorted-wave approximation. It is the reference at high impact velocities and has been extensively validated against experiments on H and He.",
      "th.cdw.rel": "Z<sub>P</sub>/v &lt; 1, i.e. E ≳ 25·Z<sub>P</sub><sup>2</sup> keV/u",
      "th.cdw.tr": "10 keV/u – 100 MeV/u · Z<sub>P</sub> = 1–9 · 333 cross sections",
      "th.ctmc.desc": "Classical simulation of the three-body problem: the projectile impinges on an ensemble of “planetary” atoms. It is non-perturbative, so it works where CDW-EIS no longer applies.",
      "th.ctmc.rel": "Intermediate energies, Z<sub>P</sub>/v ~ 1; typically within a few tens of % of experiment",
      "th.ctmc.tr": "15 keV/u – 2.5 MeV/u · Z<sub>P</sub> = 1–9 · 180 cross sections",
      "th.rudd.long": "Semiempirical model (Rudd <i>et al.</i> 1985)",
      "th.rudd.desc": "Four-parameter fit to proton-impact measurements, with the Bethe limit at high energy. It is the model used by many Monte Carlo track-structure codes.",
      "th.rudd.rel": "Protons only; typical error 10–25 % depending on the energy region",
      "th.rudd.tr": "1 keV/u – 10 MeV/u · Z<sub>P</sub> = 1 · 37 cross sections",
      "th.ranges": "Training ranges", "th.axis": "Projectile energy (keV/u)",
      "th.which": "Which one should I use?",
      "th.which.1": "<b>High energies</b> (Z<sub>P</sub>/v &lt; 1): CDW-EIS.",
      "th.which.2": "<b>Intermediate energies</b>, near the cross-section maximum: CTMC, and compare with CDW-EIS.",
      "th.which.3": "<b>Protons, to compare with codes that use Rudd</b>: Rudd.",
      "th.which.4": "Overlay the <b>experimental data</b> to see which theory best describes your case.",

      "net.text": "ACSNN is a multilayer perceptron with two hidden layers of 128 neurons and a Gaussian activation, exp(−x²), chosen because cross sections are smooth functions of energy. It takes log<sub>10</sub>E, the charge Z<sub>P</sub> and the theory encoded as a <i>one-hot</i> vector, and returns log<sub>10</sub>σ.",
      "net.key": "The network <strong>interpolates</strong> between the calculations; it does not replace the theories or correct their limitations. No values are shown outside the training range.",
      "net.n.params": "trainable parameters", "net.n.train": "training cross sections",
      "net.n.error": "error vs. CDW-EIS and CTMC · vs. Rudd",
      "net.n.holdout": "Z<sub>P</sub> = 3 left out of training (E &gt; 25 keV/u)",
      "net.archAria": "Network diagram", "net.archTheory": "theory (one-hot ×3)",
      "net.archCaption": "5 inputs → 128 → 128 → 1 output",

      "data.intro": "Turning on <i>Experimental data</i> overlays these measurements of single ionization of H. Hover over a point to see its source and DOI.",
      "data.ref": "Reference", "data.proj": "Projectile", "data.energies": "Energies (keV/u)", "data.points": "Points",

      "cite.intro": "Please cite the software and the paper that describes it:",
      "cite.review": "under review", "cite.copy": "Copy", "cite.copyBib": "Copy BibTeX",

      "footer.license": "(MIT license)",
      "footer.privacy": "All calculations run in your browser; no data is sent to any server."
    },

    es: {
      "page.title": "ACSNN — Atomic Collision Surrogate Neural Network",
      "page.description": "Predicciones con redes neuronales de secciones eficaces totales de ionización simple de hidrógeno atómico por impacto de iones desnudos (CDW-EIS, CTMC, modelo semiempírico de Rudd).",
      "lang.label": "Idioma",

      "nav.label": "Secciones", "nav.calc": "Calculadora", "nav.theories": "Teorías", "nav.network": "La red",
      "nav.data": "Datos experimentales", "nav.cite": "Cómo citar",

      "hero.kicker": "Red neuronal sustituta · Código abierto",
      "hero.tagline": "Secciones eficaces totales de <strong>ionización de hidrógeno atómico</strong> por impacto de iones desnudos, a partir de <strong>tres teorías</strong>, al instante y en su navegador.",
      "hero.lede": "Una única red neuronal reproduce los cálculos CDW-EIS, CTMC y el modelo semiempírico de Rudd para cargas del proyectil Z<sub>P</sub> = 1–9. Compare teorías y mediciones, y exporte los valores para su código de simulación (por ejemplo, de estructura de trazas).",
      "hero.toCalc": "Ir a la calculadora", "hero.github": "Código en GitHub", "hero.cite": "Cómo citar",
      "fact.theories": "teorías: CDW-EIS, CTMC, Rudd", "fact.zp": "iones desnudos sobre H",
      "fact.range": "rango de entrenamiento", "fact.error": "error de la red frente a las teorías", "fact.license": "licencia · sin instalar nada",

      "calc.eyebrow": "Calculadora", "calc.title": "Calcule y compare secciones eficaces",
      "calc.theory": "Teoría", "calc.zp": "Carga del proyectil Z<sub>P</sub>",
      "calc.zpHint": "Entrenada para Z<sub>P</sub> = 1–9 (CDW-EIS, CTMC).",
      "calc.zpHintRudd": "Rudd: solo protones (Z<sub>P</sub> = 1).",
      "calc.target": "Blanco", "calc.targetValue": "H (Z<sub>T</sub> = 1)",
      "calc.energy": "Energía (keV/u)", "calc.emin": "Energía mínima (keV/u)", "calc.emax": "Energía máxima (keV/u)",
      "calc.add": "+ Agregar al gráfico", "calc.clear": "Borrar todo",
      "calc.showExp": "Datos experimentales", "calc.showBounds": "Límites de entrenamiento", "calc.appearance": "⚙ Apariencia",
      "calc.note": "Las líneas punteadas marcan el rango de entrenamiento de cada teoría; fuera de él la curva no se dibuja.",
      "calc.noCurves": "Todavía no hay curvas en el gráfico.",

      "chip.style": "Tipo de línea", "chip.color": "Color", "chip.remove": "Quitar {name}",
      "dash.solid": "continua", "dash.dash": "a trazos", "dash.dot": "punteada", "dash.dashdot": "trazo-punto",
      "color.blue": "azul", "color.orange": "naranja", "color.green": "verde", "color.red": "rojo", "color.purple": "violeta",
      "color.brown": "marrón", "color.teal": "verde azulado", "color.gray": "gris",

      "drawer.title": "⚙ Apariencia del gráfico", "drawer.close": "Cerrar", "drawer.axes": "Ejes y unidades",
      "drawer.xscale": "Eje X", "drawer.yscale": "Eje Y", "drawer.linear": "lineal", "drawer.units": "Unidades",
      "drawer.npts": "Puntos por curva", "drawer.styleHead": "Estilo", "drawer.style": "Estilo del gráfico",
      "drawer.legend": "Leyenda", "drawer.height": "Alto del gráfico (px)",
      "drawer.live": "Los cambios se aplican en vivo; el color y el tipo de línea de cada curva se eligen en su ficha.",
      "style.clean": "Limpio", "style.journal": "Revista (ejes negros, sin grilla)", "style.plotly": "Plotly (fondo celeste)",
      "legend.inside": "Dentro (arriba a la derecha)", "legend.outside": "Fuera (a la derecha)", "legend.below": "Debajo del gráfico",

      "plot.placeholder": "Elija una teoría y una carga, y presione “+ Agregar al gráfico”.",
      "plot.xaxis": "Energía del proyectil (keV/u)", "plot.yaxis": "Sección eficaz ({unit})",
      "plot.expGroup": "Exp. Z<sub>P</sub> = {zp}",
      "dl.csv": "CSV (datos)",

      "msg.rangePositive": "Los valores del rango de energía deben ser positivos.",
      "msg.rangeOrder": "La energía mínima debe ser menor que la máxima.",
      "msg.outsideTraining": "El rango de energía está fuera del rango de entrenamiento de: {list}",
      "msg.noExp": "No hay datos experimentales para Z_P = {zp} en este rango de energía.",
      "msg.zpMax": "{func} fue entrenada solo para Z_P ≤ {max}.",
      "msg.duplicate": "{func} con Z_P = {zp} ya está en el gráfico.",
      "msg.added": "Se agregó {func} (Z_P = {zp}) al gráfico.",
      "msg.cleared": "Se quitaron todas las curvas.",
      "msg.pdfError": "No se pudo crear el PDF: {err}",
      "msg.copied": "Cita copiada al portapapeles.",

      "th.eyebrow": "Las teorías", "th.title": "Tres modelos, cada uno en su régimen",
      "net.eyebrow": "La red", "net.title": "Una sola red para tres teorías y nueve cargas",
      "data.eyebrow": "Datos experimentales", "data.title": "Mediciones para comparar",
      "cite.eyebrow": "Cómo citar", "cite.title": "Si usa estos resultados",

      "th.intro": "Ninguna teoría sola es válida en todo el rango de energías. La red se entrenó con tres fuentes complementarias, y la teoría se elige como una entrada más: así una sola red reproduce las tres, y usted elige cuál consultar.",
      "th.reliable": "Confiable", "th.trained": "Entrenada",
      "th.cdw.desc": "Aproximación cuántica de onda distorsionada, a primer orden. Es la referencia a altas velocidades de impacto y está ampliamente validada contra experimentos en H y He.",
      "th.cdw.rel": "Z<sub>P</sub>/v &lt; 1, es decir E ≳ 25·Z<sub>P</sub><sup>2</sup> keV/u",
      "th.cdw.tr": "10 keV/u – 100 MeV/u · Z<sub>P</sub> = 1–9 · 333 secciones eficaces",
      "th.ctmc.desc": "Simulación clásica del problema de tres cuerpos: el proyectil incide sobre un conjunto de átomos “planetarios”. No es perturbativa, por lo que sirve donde CDW-EIS deja de valer.",
      "th.ctmc.rel": "Energías intermedias, Z<sub>P</sub>/v ~ 1; típicamente dentro de algunas decenas de % del experimento",
      "th.ctmc.tr": "15 keV/u – 2.5 MeV/u · Z<sub>P</sub> = 1–9 · 180 secciones eficaces",
      "th.rudd.long": "Modelo semiempírico (Rudd <i>et al.</i> 1985)",
      "th.rudd.desc": "Ajuste de 4 parámetros a mediciones con protones, con el límite de Bethe a alta energía. Es el modelo que usan muchos códigos Monte Carlo de estructura de trazas.",
      "th.rudd.rel": "Solo protones; error típico 10–25 % según la región de energía",
      "th.rudd.tr": "1 keV/u – 10 MeV/u · Z<sub>P</sub> = 1 · 37 secciones eficaces",
      "th.ranges": "Rangos de entrenamiento", "th.axis": "Energía del proyectil (keV/u)",
      "th.which": "¿Cuál uso?",
      "th.which.1": "<b>Altas energías</b> (Z<sub>P</sub>/v &lt; 1): CDW-EIS.",
      "th.which.2": "<b>Energías intermedias</b>, cerca del máximo de la sección eficaz: CTMC, y compare con CDW-EIS.",
      "th.which.3": "<b>Protones, para comparar con códigos que usan Rudd</b>: Rudd.",
      "th.which.4": "Superponga los <b>datos experimentales</b> para ver qué teoría describe mejor su caso.",

      "net.text": "ACSNN es un perceptrón multicapa con dos capas ocultas de 128 neuronas y activación gaussiana, exp(−x²), elegida porque las secciones eficaces son funciones suaves de la energía. Recibe log<sub>10</sub>E, la carga Z<sub>P</sub> y la teoría codificada como vector <i>one-hot</i>, y devuelve log<sub>10</sub>σ.",
      "net.key": "La red <strong>interpola</strong> entre los cálculos; no reemplaza a las teorías ni corrige sus limitaciones. Fuera del rango de entrenamiento no se muestran valores.",
      "net.n.params": "parámetros entrenables", "net.n.train": "secciones eficaces de entrenamiento",
      "net.n.error": "error vs CDW-EIS y CTMC · vs Rudd",
      "net.n.holdout": "Z<sub>P</sub> = 3 excluido del entrenamiento (E &gt; 25 keV/u)",
      "net.archAria": "Esquema de la red", "net.archTheory": "teoría (one-hot ×3)",
      "net.archCaption": "5 entradas → 128 → 128 → 1 salida",

      "data.intro": "Al activar <i>Datos experimentales</i> se superponen estas mediciones de ionización simple de H. Pase el cursor sobre un punto para ver su fuente y DOI.",
      "data.ref": "Referencia", "data.proj": "Proyectil", "data.energies": "Energías (keV/u)", "data.points": "Puntos",

      "cite.intro": "Cite el software y el artículo que lo describe:",
      "cite.review": "en revisión", "cite.copy": "Copiar", "cite.copyBib": "Copiar BibTeX",

      "footer.license": "(licencia MIT)",
      "footer.privacy": "Todos los cálculos se hacen en su navegador; no se envían datos a ningún servidor."
    }
  };

  const KEY = "acsnn-lang";
  function initialLang() {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q && STRINGS[q]) return q;
    } catch (e) { /* ignore */ }
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && STRINGS[saved]) return saved;
    } catch (e) { /* storage blocked (file://, private mode) */ }
    return "es"; // family default (same as the ion-track-mc page); the browser language is not used
  }

  let lang = initialLang();

  function t(key, vars) {
    let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key];
    if (s === undefined) { console.warn("i18n: missing key " + key); return key; }
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  }

  function apply() {
    document.documentElement.lang = lang;
    document.title = t("page.title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("page.description"));
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }

  function setLang(l) {
    if (!STRINGS[l] || l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    apply();
    root.dispatchEvent(new Event("langchange"));
  }

  root.I18N = { t: t, apply: apply, setLang: setLang, lang: () => lang, languages: Object.keys(STRINGS), STRINGS: STRINGS };
})(window);
