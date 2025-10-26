// Bërthama e kodit të Caesar + Kodi
const BASE_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE_LOWER = "abcdefghijklmnopqrstuvwxyz";
const BASE_DIGIT = "0123456789";
const ALB_UP = "ÇË";
const ALB_LO = "çë";

function buildAlphabets(includeDigits, includeAlbanian) {
  const upper = BASE_UPPER + (includeAlbanian ? ALB_UP : "");
  const lower = BASE_LOWER + (includeAlbanian ? ALB_LO : "");
  const digits = includeDigits ? BASE_DIGIT : "";
  return { upper, lower, digits };
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function shiftChar(ch, shift, alphabets) {
  const { upper, lower, digits } = alphabets;
  let i;
  if ((i = upper.indexOf(ch)) !== -1) return upper[mod(i + shift, upper.length)];
  if ((i = lower.indexOf(ch)) !== -1) return lower[mod(i + shift, lower.length)];
  if (digits && (i = digits.indexOf(ch)) !== -1) return digits[mod(i + shift, digits.length)];
  return ch;
}

function transform(text, shift, mode, includeDigits, includeAlbanian) {
  if (!Number.isFinite(shift)) throw new Error("Shift i pavlefshëm");
  const eff = mode === "decrypt" ? -shift : shift;
  const alph = buildAlphabets(includeDigits, includeAlbanian);
  if (!alph.upper.length && !alph.lower.length && !alph.digits.length) {
    throw new Error("Asnjë alfabet i aktivizuar");
  }
  let out = "";
  for (const ch of text) out += shiftChar(ch, eff, alph);
  return out;
}

// --- Kodi DOM ---
const el = (id) => document.getElementById(id);
const input = el("input");
const output = el("output");
const mode = el("mode");
const shift = el("shift");
const digits = el("digits");
const albanian = el("albanian");
const live = el("live");

function runOnce() {
  try {
    const s = parseInt(shift.value, 10) || 0;
    output.value = transform(input.value, s, mode.value, digits.checked, albanian.checked);
    output.setCustomValidity("");
  } catch (e) {
    output.value = "";
    output.setCustomValidity(e.message || "Gabim");
  }
}

["input", "change", "keyup"].forEach((ev) => input.addEventListener(ev, () => live.checked && runOnce()));
[mode, shift, digits, albanian, live].forEach((ctrl) => ctrl.addEventListener("change", () => live.checked && runOnce()));

el("run").addEventListener("click", runOnce);
el("swap").addEventListener("click", () => {
  const tmp = input.value; input.value = output.value; output.value = tmp; runOnce();
});
el("copyOut").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(output.value || ""); } catch {}
});
el("sample").addEventListener("click", () => {
  input.value = "Përshëndetje, Botë 2025! – Çfarë ka të re? 0123456789";
  shift.value = 5; mode.value = "encrypt"; digits.checked = true; albanian.checked = true; runOnce();
});
el("clear").addEventListener("click", () => { input.value = ""; output.value = ""; input.focus(); });

// Shkarko .txt
el("downloadTxt").addEventListener("click", () => {
  const blob = new Blob([output.value || ""], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cezari_output.txt";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
});

// First run
runOnce();
