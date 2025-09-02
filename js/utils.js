export function fmtDate(dt) {
  try {
    const d = new Date(dt);
    if (isNaN(d)) return '-';
    return d.toLocaleString();
  } catch { return '-'; }
}
export function fmtDateOnly(dt) {
  try {
    const d = new Date(dt);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString();
  } catch { return '-'; }
}
export function qs(sel) { return document.querySelector(sel); }
export function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }
export function serializeForm(form) {
  const data = new FormData(form);
  const obj = {};
  for (const [k,v] of data.entries()) obj[k]=v;
  return obj;
}
