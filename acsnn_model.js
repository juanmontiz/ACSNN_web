// ACSNN neural network inference: JavaScript port of acsnn/model.py from
// ACSNN Calculator v1.0.0 (https://github.com/juanmontiz/ACSNN_Calculator).
//
// Architecture: Linear(5->128) -> Gaussian -> Linear(128->128) -> Gaussian -> Linear(128->1)
// Gaussian activation: exp(-x^2)
// Input features: [Z_projectile, log10(E [keV/u]), one-hot(theory) x3]
// Output: log10(cross section [cm^2])  ->  returned as 10^output
// Trained for atomic hydrogen targets only (Z_target = 1).
// Like predict_conditional() in Python, returns NaN outside the training energy range
// of each theory and for Z_projectile above the safe limit.
// validity() mirrors validity_flags() in Python: "outside_training" (NaN), "outside_validity"
// (value returned, theory outside its physical validity domain) or "valid".
(function (root) {
  "use strict";

  const ACTIVATIONS = {
    gaussian: function (v) { return Math.exp(-v * v); },
    elu: function (v) { return v >= 0 ? v : Math.exp(v) - 1.0; }
  };

  function createModel(weights) {
    const act = ACTIVATIONS[weights.activation];
    if (!act) throw new Error("Unknown activation: " + weights.activation);
    const layers = weights.layers.map(function (l) {
      return { W: l.W.map(function (r) { return Float64Array.from(r); }), b: Float64Array.from(l.b) };
    });
    const theories = weights.theories;
    const eMin = weights.train_e_min, eMax = weights.train_e_max, zpSafe = weights.zproj_safe;

    function forward(input) {
      let x = input;
      for (let li = 0; li < layers.length; li++) {
        const W = layers[li].W, b = layers[li].b;
        const out = new Float64Array(b.length);
        for (let i = 0; i < b.length; i++) {
          const row = W[i];
          let s = b[i];
          for (let j = 0; j < x.length; j++) s += row[j] * x[j];
          out[i] = li < layers.length - 1 ? act(s) : s;
        }
        x = out;
      }
      return x[0];
    }

    // energies: array of energies in keV/u. Returns cross sections in cm^2 (NaN = outside training domain).
    function predict(theory, zp, energies) {
      const idx = theories.indexOf(theory);
      if (idx < 0) throw new Error("Unknown theory: " + theory);
      const input = new Float64Array(2 + theories.length);
      input[0] = zp; input[2 + idx] = 1.0;
      const zpOk = zp <= zpSafe[theory];
      const lo = Math.log10(eMin[theory]), hi = Math.log10(eMax[theory]);
      return energies.map(function (e) {
        const le = Math.log10(e);
        if (!zpOk || le < lo || le > hi) return NaN;
        input[1] = le;
        return Math.pow(10, forward(input));
      });
    }

    // Physical validity domain [min, max] in keV/u (soft limit; see acsnn/config.py)
    const val = weights.validity;
    function validityRange(theory, zp) {
      if (theory === "CDW-EIS") return [val.e_per_au_velocity2 * zp * zp, Infinity];
      if (theory === "CTMC") return val.ctmc.slice();
      if (theory === "Semiempiric_1985Rudd") return [0, Infinity];
      throw new Error("Unknown theory: " + theory);
    }

    function validity(theory, zp, energies) {
      const r = validityRange(theory, zp);
      const zpOk = zp <= zpSafe[theory];
      return energies.map(function (e) {
        if (!zpOk || e < eMin[theory] || e > eMax[theory]) return "outside_training";
        return e <= r[0] || e > r[1] ? "outside_validity" : "valid";
      });
    }

    return {
      predict: predict,
      validity: validity,
      validityRange: validityRange,
      theories: theories,
      trainRange: function (theory) { return [eMin[theory], eMax[theory]]; },
      zpMax: function (theory) { return zpSafe[theory]; },
      version: weights.version
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { createModel: createModel };
  else root.ACSNNModel = { createModel: createModel };
})(this);
