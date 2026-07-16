// Generates hero SVGs (1200x675) for GreenGrid India launch articles.
// Charts use the validated palette: green #17693e, amber #b06f10, blue #2e66c7;
// sequential green ramp #cde7d6..#0f4c2c (monotonic lightness).
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = '/home/user/renewable/public/images';
mkdirSync(OUT, { recursive: true });

const W = 1200, H = 675;
const INK = '#17211b', MUTED = '#5d6a62', GREEN = '#17693e', GREEN_DARK = '#0f4c2c',
  AMBER = '#b06f10', BLUE = '#2e66c7', PALE = '#e9f3ec', SURFACE = '#fcfcfb',
  SUN = '#f2c94c';

const SANS = 'Arial, Helvetica, sans-serif';
const SERIF = 'Georgia, serif';

function svgDoc(body, bg = SURFACE) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${SANS}">
<rect width="${W}" height="${H}" fill="${bg}"/>
${body}
<rect x="0" y="${H - 10}" width="${W}" height="10" fill="${GREEN_DARK}"/>
</svg>`;
}

const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;');

function chartHeader(kicker, title, sub) {
  kicker = esc(kicker.toUpperCase());
  return `
<text x="70" y="78" font-size="22" letter-spacing="4" fill="${GREEN}" font-weight="bold">${kicker}</text>
<text x="70" y="132" font-size="44" font-family="${SERIF}" font-weight="bold" fill="${INK}">${title}</text>
${sub ? `<text x="70" y="172" font-size="24" fill="${MUTED}">${sub}</text>` : ''}`;
}

function sourceNote(text) {
  return `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Source: ${text} · Graphic: GreenGrid India</text>`;
}

// Column with rounded top (4px), anchored flat to baseline.
function col(x, yTop, w, yBase, fill) {
  const r = Math.min(4, (yBase - yTop) / 2);
  return `<path d="M${x} ${yBase} L${x} ${yTop + r} Q${x} ${yTop} ${x + r} ${yTop} L${x + w - r} ${yTop} Q${x + w} ${yTop} ${x + w} ${yTop + r} L${x + w} ${yBase} Z" fill="${fill}"/>`;
}

// Horizontal bar with rounded right end, anchored to left baseline.
function hbar(x, y, len, h, fill) {
  const r = Math.min(4, len / 2);
  return `<path d="M${x} ${y} L${x + len - r} ${y} Q${x + len} ${y} ${x + len} ${y + r} L${x + len} ${y + h - r} Q${x + len} ${y + h} ${x + len - r} ${y + h} L${x} ${y + h} Z" fill="${fill}"/>`;
}

// ---- column chart hero ----
function columnChart({ kicker, title, sub, bars, unit, source, maxOverride }) {
  const plotTop = 225, plotBase = 560, plotL = 110, plotR = W - 110;
  const max = maxOverride ?? Math.max(...bars.map((b) => b.v)) * 1.15;
  const n = bars.length;
  const slot = (plotR - plotL) / n;
  const bw = Math.min(150, slot * 0.52);
  let out = `<line x1="${plotL - 30}" y1="${plotBase}" x2="${plotR + 30}" y2="${plotBase}" stroke="#c9d4cc" stroke-width="2"/>`;
  bars.forEach((b, i) => {
    const x = plotL + slot * i + (slot - bw) / 2;
    const hpx = ((plotBase - plotTop) * b.v) / max;
    const yTop = plotBase - hpx;
    out += col(x, yTop, bw, plotBase, b.color || GREEN);
    out += `<text x="${x + bw / 2}" y="${yTop - 16}" font-size="30" font-weight="bold" fill="${INK}" text-anchor="middle">${b.label ?? b.v}${unit ? ` ${unit}` : ''}</text>`;
    out += `<text x="${x + bw / 2}" y="${plotBase + 34}" font-size="22" fill="${MUTED}" text-anchor="middle">${b.name}</text>`;
    if (b.name2) out += `<text x="${x + bw / 2}" y="${plotBase + 60}" font-size="19" fill="${MUTED}" text-anchor="middle">${b.name2}</text>`;
  });
  return svgDoc(chartHeader(kicker, title, sub) + out + sourceNote(source));
}

// ---- horizontal bar chart hero ----
function barChart({ kicker, title, sub, bars, unit, source }) {
  const plotL = 320, plotR = W - 130, top = 215;
  const max = Math.max(...bars.map((b) => b.v)) * 1.12;
  const rowH = Math.min(64, (560 - top) / bars.length);
  const bh = Math.min(34, rowH * 0.6);
  let out = '';
  bars.forEach((b, i) => {
    const y = top + rowH * i + (rowH - bh) / 2;
    const len = ((plotR - plotL) * b.v) / max;
    out += `<text x="${plotL - 18}" y="${y + bh / 2 + 8}" font-size="23" fill="${INK}" text-anchor="end">${b.name}</text>`;
    out += hbar(plotL, y, len, bh, b.color || GREEN);
    out += `<text x="${plotL + len + 14}" y="${y + bh / 2 + 8}" font-size="24" font-weight="bold" fill="${INK}">${b.label ?? b.v}${unit ? ` ${unit}` : ''}</text>`;
  });
  out += `<line x1="${plotL}" y1="${top - 12}" x2="${plotL}" y2="${top + rowH * bars.length + 6}" stroke="#c9d4cc" stroke-width="2"/>`;
  return svgDoc(chartHeader(kicker, title, sub) + out + sourceNote(source));
}

// ---- stat tile hero ----
function statTile({ kicker, title, big, bigSub, facts, source }) {
  let out = chartHeader(kicker, title, '');
  out += `<text x="70" y="360" font-size="150" font-family="${SERIF}" font-weight="bold" fill="${GREEN_DARK}">${big}</text>`;
  out += `<text x="70" y="415" font-size="30" fill="${MUTED}">${bigSub}</text>`;
  facts.forEach((f, i) => {
    const x = 70 + i * 360;
    out += `<rect x="${x}" y="465" width="330" height="110" rx="8" fill="${PALE}"/>
<text x="${x + 24}" y="513" font-size="34" font-weight="bold" fill="${GREEN_DARK}">${f.v}</text>
<text x="${x + 24}" y="548" font-size="20" fill="${MUTED}">${f.k}</text>`;
  });
  return svgDoc(out + sourceNote(source));
}

// ================= illustration motifs =================
function sun(cx, cy, r = 46) {
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    const x1 = cx + Math.cos(a) * (r + 14), y1 = cy + Math.sin(a) * (r + 14);
    const x2 = cx + Math.cos(a) * (r + 34), y2 = cy + Math.sin(a) * (r + 34);
    rays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SUN}" stroke-width="9" stroke-linecap="round"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SUN}"/>${rays}`;
}

function panel(x, y, w = 190, h = 110, tilt = true) {
  const skew = tilt ? -14 : 0;
  let cells = '';
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++)
      cells += `<rect x="${x + 10 + c * ((w - 20) / 3) + 3}" y="${y + 10 + r * ((h - 20) / 2) + 3}" width="${(w - 20) / 3 - 6}" height="${(h - 20) / 2 - 6}" rx="3" fill="#2b5f8f"/>`;
  return `<g transform="skewX(${skew})" transform-origin="${x} ${y + h}">
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#1d4869"/>${cells}
</g>
<rect x="${x + w / 2 - 7}" y="${y + h}" width="14" height="46" fill="#66756b"/>`;
}

function turbine(x, groundY, s = 1) {
  const hubY = groundY - 240 * s;
  const blade = `M0 0 L${14 * s} ${-118 * s} Q0 ${-138 * s} ${-14 * s} ${-118 * s} Z`;
  return `<path d="M${x - 10 * s} ${groundY} L${x - 4 * s} ${hubY} L${x + 4 * s} ${hubY} L${x + 10 * s} ${groundY} Z" fill="#d7ded9"/>
<g transform="translate(${x},${hubY})">
  <g transform="rotate(15)"><path d="${blade}" fill="#e8eeea"/></g>
  <g transform="rotate(135)"><path d="${blade}" fill="#e8eeea"/></g>
  <g transform="rotate(255)"><path d="${blade}" fill="#e8eeea"/></g>
  <circle r="${11 * s}" fill="#b9c4bd"/>
</g>`;
}

function factory(x, y, w = 380, h = 190, roofColor = GREEN) {
  const bay = w / 4;
  let roof = '';
  for (let i = 0; i < 4; i++)
    roof += `<path d="M${x + i * bay} ${y} L${x + i * bay} ${y - 46} L${x + (i + 0.72) * bay} ${y} Z" fill="${roofColor}"/>`;
  let win = '';
  for (let i = 0; i < 4; i++)
    win += `<rect x="${x + i * bay + 18}" y="${y + 36}" width="${bay - 44}" height="52" rx="4" fill="#cfe0d5"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2f4a3a"/>${roof}${win}
<rect x="${x + 24}" y="${y + h - 74}" width="64" height="74" rx="4" fill="#1c2e24"/>
<rect x="${x + w - 60}" y="${y - 120}" width="26" height="120" fill="#3d5a49"/>`;
}

function battery(x, y, w = 210, h = 120, fillPct = 0.72) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="${GREEN_DARK}" stroke-width="10"/>
<rect x="${x + w + 6}" y="${y + h / 2 - 22}" width="18" height="44" rx="6" fill="${GREEN_DARK}"/>
<rect x="${x + 16}" y="${y + 16}" width="${(w - 32) * fillPct}" height="${h - 32}" rx="8" fill="${GREEN}"/>
<path d="M${x + w * 0.46} ${y + 24} l-26 ${h / 2 - 12} h20 l-12 ${h / 2 - 24} 34 -${h / 2} h-22 l14 -${h / 2 - 16} Z" fill="${SUN}"/>`;
}

function pylon(x, groundY, s = 1) {
  const t = (v) => v * s;
  return `<g stroke="#7d8a80" stroke-width="${6 * s}" fill="none" stroke-linecap="round">
<path d="M${x - t(52)} ${groundY} L${x - t(14)} ${groundY - t(210)} L${x + t(14)} ${groundY - t(210)} L${x + t(52)} ${groundY}"/>
<path d="M${x - t(44)} ${groundY - t(52)} L${x + t(44)} ${groundY - t(52)}"/>
<path d="M${x - t(36)} ${groundY - t(110)} L${x + t(36)} ${groundY - t(110)}"/>
<path d="M${x - t(58)} ${groundY - t(160)} L${x + t(58)} ${groundY - t(160)}"/>
<path d="M${x - t(44)} ${groundY - t(52)} L${x + t(36)} ${groundY - t(110)} M${x + t(44)} ${groundY - t(52)} L${x - t(36)} ${groundY - t(110)}"/>
</g>`;
}

function house(x, groundY, w = 170, roofPanel = true) {
  const h = 110, y = groundY - h;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e6d8bf"/>
<path d="M${x - 14} ${y} L${x + w / 2} ${y - 66} L${x + w + 14} ${y} Z" fill="#a8674b"/>
${roofPanel ? `<g transform="rotate(-21 ${x + w / 2} ${y - 26})"><rect x="${x + w * 0.16}" y="${y - 52}" width="86" height="46" rx="4" fill="#1d4869"/><line x1="${x + w * 0.16 + 28}" y1="${y - 52}" x2="${x + w * 0.16 + 28}" y2="${y - 6}" stroke="#2b5f8f" stroke-width="4"/><line x1="${x + w * 0.16 + 57}" y1="${y - 52}" x2="${x + w * 0.16 + 57}" y2="${y - 6}" stroke="#2b5f8f" stroke-width="4"/></g>` : ''}
<rect x="${x + w / 2 - 18}" y="${groundY - 52}" width="36" height="52" fill="#7a5340"/>
<rect x="${x + 18}" y="${y + 26}" width="34" height="30" fill="#cfe0d5"/>
<rect x="${x + w - 52}" y="${y + 26}" width="34" height="30" fill="#cfe0d5"/>`;
}

function illoHeader(kicker, title) {
  kicker = esc(kicker.toUpperCase());
  return `
<text x="70" y="86" font-size="22" letter-spacing="4" fill="${GREEN}" font-weight="bold">${kicker}</text>
<text x="70" y="146" font-size="46" font-family="${SERIF}" font-weight="bold" fill="${INK}">${title}</text>`;
}

function groundRect(y = 545, color = '#dceadf') {
  return `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${color}"/>`;
}

const files = {};

// 1. Navurja — factory + encapsulant film roll + panels
files['hero-navurja.svg'] = svgDoc(
  illoHeader('Manufacturing', 'A new solar components hub near Bhopal') +
    groundRect() +
    sun(1050, 130) +
    factory(120, 360, 420, 185) +
    // film roll
    `<g>
<ellipse cx="700" cy="475" rx="34" ry="70" fill="#cdd8d0"/>
<rect x="700" y="405" width="190" height="140" fill="#e4ebe6"/>
<ellipse cx="890" cy="475" rx="34" ry="70" fill="#f3f6f4"/>
<ellipse cx="890" cy="475" rx="14" ry="34" fill="#9fb2a6"/>
<text x="795" y="483" font-size="20" fill="${MUTED}" text-anchor="middle">EVA / POE film</text>
</g>` +
    panel(980, 430, 170, 100) +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 2. Record H1 2026 additions — column chart
files['hero-h1-2026-record.svg'] = columnChart({
  kicker: 'Capacity additions',
  title: 'India&#8217;s record first half of 2026',
  sub: 'New renewable capacity added, January&#8211;June 2026 (GW)',
  unit: 'GW',
  bars: [
    { name: 'Utility-scale solar', v: 19.0, label: '~19' },
    { name: 'Rooftop solar', v: 6.4, label: '6.4' },
    { name: 'Wind', v: 2.9, label: '2.9' },
  ],
  source: 'JMK Research; industry reports, July 2026',
});

// 3. Rooftop boom — column chart
files['hero-rooftop-boom.svg'] = columnChart({
  kicker: 'Rooftop solar',
  title: 'Rooftop additions have doubled',
  sub: 'Rooftop solar capacity added in first half of year (GW)',
  unit: 'GW',
  bars: [
    { name: 'H1 2025', v: 3.1, label: '~3.1', color: '#8fcfa8' },
    { name: 'H1 2026', v: 6.4, label: '6.4', color: GREEN },
  ],
  source: 'Industry reports on PM Surya Ghar progress, July 2026',
});

// 4. ALMM List-II — illustration (checklist + cell)
files['hero-almm-list2.svg'] = svgDoc(
  illoHeader('Policy & Markets', 'ALMM List-II: the cell mandate arrives') +
    groundRect(560) +
    // clipboard
    `<g>
<rect x="150" y="215" width="330" height="330" rx="14" fill="#ffffff" stroke="#c9d4cc" stroke-width="4"/>
<rect x="255" y="196" width="120" height="44" rx="10" fill="${GREEN_DARK}"/>
<text x="315" y="290" font-size="26" font-weight="bold" fill="${INK}" text-anchor="middle">ALMM  LIST-II</text>
${[0, 1, 2].map((i) => `<circle cx="205" cy="${340 + i * 60}" r="16" fill="${PALE}" stroke="${GREEN}" stroke-width="4"/><path d="M${197} ${340 + i * 60} l6 8 12 -16" stroke="${GREEN}" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="240" y="${330 + i * 60}" width="190" height="18" rx="9" fill="#dfe7e1"/>`).join('')}
</g>` +
    // solar cell close-up
    `<g>
<rect x="640" y="240" width="300" height="300" rx="10" fill="#1d4869"/>
${[1, 2, 3].map((i) => `<line x1="${640 + i * 75}" y1="240" x2="${640 + i * 75}" y2="540" stroke="#2b5f8f" stroke-width="6"/>`).join('')}
${[1, 2, 3].map((i) => `<line x1="640" y1="${240 + i * 75}" x2="940" y2="${240 + i * 75}" stroke="#2b5f8f" stroke-width="6"/>`).join('')}
<text x="790" y="590" font-size="22" fill="${MUTED}" text-anchor="middle">Made-in-India solar cells</text>
</g>` +
    sun(1060, 150, 40) +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 5. Manufacturing capacity — column chart
files['hero-manufacturing-172gw.svg'] = columnChart({
  kicker: 'Manufacturing',
  title: 'Modules race ahead of cells',
  sub: 'India&#8217;s solar manufacturing capacity (GW, 2026)',
  unit: 'GW',
  bars: [
    { name: 'Module capacity', v: 172, label: '172' },
    { name: 'Cell capacity', v: 27, label: '27' },
  ],
  source: 'MNRE statements; IEEFA, 2026',
});

// 6. BESS surge — column chart
files['hero-bess-surge.svg'] = columnChart({
  kicker: 'Energy storage',
  title: 'Battery storage&#8217;s eleven-fold jump',
  sub: 'Operational battery energy storage in India (GWh)',
  unit: 'GWh',
  bars: [
    { name: 'Dec 2025', v: 0.78, label: '0.78', color: '#8fcfa8' },
    { name: 'Jun 2026', v: 8.7, label: '8.7', color: GREEN },
  ],
  source: 'Industry trackers, July 2026',
});

// 7. SECI tender — illustration (document + sun + panels)
files['hero-seci-tender.svg'] = svgDoc(
  illoHeader('Tenders', 'SECI floats 700 MW solar tender') +
    groundRect(560) +
    sun(1055, 150, 42) +
    `<g>
<rect x="160" y="210" width="300" height="360" rx="10" fill="#ffffff" stroke="#c9d4cc" stroke-width="4"/>
<rect x="195" y="250" width="230" height="20" rx="10" fill="${GREEN_DARK}"/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="195" y="${300 + i * 40}" width="${230 - (i % 2) * 60}" height="14" rx="7" fill="#dfe7e1"/>`).join('')}
<circle cx="400" cy="520" r="34" fill="${PALE}" stroke="${GREEN}" stroke-width="4"/>
<text x="400" y="530" font-size="20" font-weight="bold" fill="${GREEN_DARK}" text-anchor="middle">700</text>
<text x="288" y="605" font-size="21" fill="${MUTED}" text-anchor="middle">Notice Inviting Tender · July 2026</text>
</g>` +
    panel(620, 430, 200, 115) +
    panel(870, 430, 200, 115) +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 8. Green hydrogen for steel — illustration
files['hero-h2-steel.svg'] = svgDoc(
  illoHeader('Green hydrogen', 'H&#8322; heads for the blast furnace') +
    groundRect(560) +
    factory(640, 370, 420, 175, '#4a5f70') +
    `<g>
<circle cx="260" cy="360" r="110" fill="${PALE}" stroke="${GREEN}" stroke-width="6"/>
<text x="260" y="385" font-size="72" font-weight="bold" fill="${GREEN_DARK}" text-anchor="middle">H&#8322;</text>
<circle cx="150" cy="260" r="26" fill="#bfe0cc"/>
<circle cx="372" cy="252" r="20" fill="#bfe0cc"/>
<circle cx="330" cy="472" r="16" fill="#bfe0cc"/>
</g>
<path d="M380 380 C480 380 500 440 620 445" stroke="${GREEN}" stroke-width="10" fill="none" stroke-dasharray="2 20" stroke-linecap="round"/>` +
    `<text x="850" y="605" font-size="21" fill="${MUTED}" text-anchor="middle">Steel plant pilot projects</text>` +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 9. MNRE budget — stat tile
files['hero-mnre-budget.svg'] = statTile({
  kicker: 'Policy & Markets',
  title: 'MNRE&#8217;s growing war chest',
  big: '&#8377;32,914 cr',
  bigSub: 'Ministry of New and Renewable Energy allocation — up 30% year on year',
  facts: [
    { v: '+30%', k: 'Increase over prior year' },
    { v: 'Solar &amp; storage', k: 'Key spending priorities' },
    { v: 'Green H&#8322; Mission', k: 'Continued funding' },
  ],
  source: 'Union Budget documents; MNRE',
});

// 10. Gujarat industrial policy — illustration
files['hero-gujarat-policy.svg'] = svgDoc(
  illoHeader('Policy & Markets', 'Gujarat bets on clean energy manufacturing') +
    groundRect(560) +
    sun(1060, 150, 40) +
    factory(120, 380, 360, 165) +
    battery(580, 430, 190, 105, 0.72) +
    `<g>
<circle cx="950" cy="450" r="82" fill="${PALE}" stroke="${GREEN}" stroke-width="6"/>
<text x="950" y="472" font-size="52" font-weight="bold" fill="${GREEN_DARK}" text-anchor="middle">H&#8322;</text>
</g>` +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 11. Wind slowdown — column chart
files['hero-wind-slowdown.svg'] = columnChart({
  kicker: 'Wind',
  title: 'Wind&#8217;s slower half-year',
  sub: 'Wind capacity added in first half of year (GW)',
  unit: 'GW',
  bars: [
    { name: 'H1 2025', v: 3.5, label: '3.5', color: '#8fcfa8' },
    { name: 'H1 2026', v: 2.9, label: '2.9', color: GREEN },
  ],
  source: 'Industry reports, July 2026',
});

// 12. State race — horizontal bars
files['hero-state-race.svg'] = barChart({
  kicker: 'Solar',
  title: 'Where H1 2026 solar was built',
  sub: 'Solar capacity added by state, Jan&#8211;Jun 2026 (GW)',
  unit: 'GW',
  bars: [
    { name: 'Gujarat', v: 7.6, label: '7.6' },
    { name: 'Rajasthan', v: 6.6, label: '6.6' },
    { name: 'Tamil Nadu', v: 2.4, label: '2.4' },
    { name: 'Rest of India', v: 9.4, label: '~9.4', color: '#8fcfa8' },
  ],
  source: 'JMK Research; industry reports, July 2026',
});

// 13. Solar + storage vs coal — illustration
files['hero-storage-tariffs.svg'] = svgDoc(
  illoHeader('Storage', 'Solar-plus-storage takes on new coal') +
    groundRect(560) +
    sun(300, 250, 44) +
    panel(170, 420, 200, 115) +
    battery(430, 430, 190, 105, 0.78) +
    // scale/balance motif
    `<g stroke="#7d8a80" stroke-width="8" fill="none" stroke-linecap="round">
<line x1="920" y1="250" x2="920" y2="530"/>
<line x1="790" y1="300" x2="1050" y2="300"/>
</g>
<path d="M790 300 l-44 90 a44 44 0 0 0 88 0 Z" fill="${PALE}" stroke="${GREEN}" stroke-width="5"/>
<path d="M1050 300 l-44 90 a44 44 0 0 0 88 0 Z" fill="#eee7dd" stroke="#8a7a66" stroke-width="5"/>
<text x="790" y="470" font-size="20" fill="${MUTED}" text-anchor="middle">RE + storage</text>
<text x="1050" y="470" font-size="20" fill="${MUTED}" text-anchor="middle">New coal</text>` +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 14. IESW 2026 — illustration
files['hero-iesw-2026.svg'] = svgDoc(
  illoHeader('Storage', 'Takeaways from India Energy Storage Week') +
    groundRect(560) +
    // stage/banner
    `<rect x="150" y="230" width="900" height="130" rx="12" fill="${GREEN_DARK}"/>
<text x="600" y="290" font-size="40" font-family="${SERIF}" font-weight="bold" fill="#ffffff" text-anchor="middle">IESW 2026</text>
<text x="600" y="332" font-size="22" fill="#bfe0cc" text-anchor="middle">New Delhi · 8&#8211;10 July 2026</text>` +
    battery(240, 440, 180, 95, 0.7) +
    `<g>
<circle cx="640" cy="490" r="52" fill="${PALE}" stroke="${GREEN}" stroke-width="5"/>
<text x="640" y="505" font-size="34" font-weight="bold" fill="${GREEN_DARK}" text-anchor="middle">EV</text>
</g>` +
    `<g>
<circle cx="880" cy="490" r="52" fill="${PALE}" stroke="${GREEN}" stroke-width="5"/>
<text x="880" y="506" font-size="32" font-weight="bold" fill="${GREEN_DARK}" text-anchor="middle">H&#8322;</text>
</g>` +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

// 15. RE mix — horizontal bars (sequential by magnitude)
files['hero-re-mix.svg'] = barChart({
  kicker: 'The big picture',
  title: 'What makes up India&#8217;s 288 GW of RE',
  sub: 'Share of installed renewable capacity, June 2026',
  bars: [
    { name: 'Solar', v: 56, label: '56%', color: GREEN_DARK },
    { name: 'Wind', v: 20, label: '20%', color: GREEN },
    { name: 'Large hydro', v: 18, label: '18%', color: '#4fae7d' },
    { name: 'Bio power', v: 4, label: '4%', color: '#8fcfa8' },
    { name: 'Small hydro', v: 2, label: '2%', color: '#cde7d6' },
  ],
  source: 'MNRE / CEA data, June 2026',
});

// 16. Kerala BESS — illustration
files['hero-kerala-bess.svg'] = svgDoc(
  illoHeader('Storage', 'Kerala&#8217;s 750 MW battery push') +
    groundRect(560) +
    pylon(950, 560, 1.15) +
    battery(180, 400, 250, 140, 0.75) +
    `<path d="M470 470 C580 470 620 430 720 430 820 430 850 470 905 470" stroke="${GREEN}" stroke-width="10" fill="none" stroke-dasharray="2 22" stroke-linecap="round"/>` +
    // palm tree for coastal Kerala
    `<g>
<path d="M640 560 C632 500 640 460 660 430" stroke="#7a5340" stroke-width="16" fill="none" stroke-linecap="round"/>
${[-70, -30, 20, 60].map((a) => `<path d="M660 430 q${a} -34 ${a * 1.6} -6" stroke="${GREEN}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('')}
</g>` +
    `<text x="70" y="${H - 36}" font-size="19" fill="${MUTED}">Illustration: GreenGrid India</text>`,
  '#f2f8f4'
);

for (const [name, content] of Object.entries(files)) {
  writeFileSync(`${OUT}/${name}`, content);
  console.log('wrote', name);
}
