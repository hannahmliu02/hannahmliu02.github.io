// RAI page graph: ARC → TrustX → ROAR across the page, with the standards ARC is grounded in and the
// components each framework covers. On wide screens each diamond sits above its spotlight column.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const wideMQ = matchMedia("(min-width: 740px)");
  const canvas = document.getElementById("rai-graph");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const capEl = document.getElementById("graph-cap");
  const DEFAULT_CAP = capEl.innerHTML;
  const spot = document.getElementById("spot");
  const cols = [...spot.querySelectorAll(".col")];

  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ----- Graph data. `nar` = narrow (vertical) layout in fractions of W and H. Wide positions are computed in layout(). -----
  const N = [
    { id: "arc", kind: "core", name: "ARC", nar: [0.5, 0.36], href: "#arc",
      title: "TrustX Agent Risk Classification (ARC).", cap: "A structured, iterable framework for classifying the risk of agentic AI systems." },
    { id: "trustx", kind: "core", name: "TrustX", nar: [0.5, 0.60], href: "#trustx",
      title: "TrustX Expanded Risk Framework.", cap: "Builds off ARC by adding procurement risk and exposure risk to legacy systems." },
    { id: "roar", kind: "core", name: "ROAR", nar: [0.5, 0.84], href: "#roar",
      title: "RAI Open AI Registry (ROAR).", cap: "An open source platform that shows how AI applications map to the TrustX risk framework." },
    { id: "types", kind: "fact", name: "7 agentic AI system types", nar: [0.12, 0.35],
      title: "7 agentic AI system types.", cap: "ARC provides risk classification for each of them." },
    { id: "dims", kind: "fact", name: "12-risk-dimension core", nar: [0.17, 0.50],
      title: "12-risk-dimension core.", cap: "Introduced in ARC. The expanded TrustX framework keeps it." },
    { id: "procure", kind: "fact", name: "Procurement risk", nar: [0.15, 0.635],
      title: "Procurement risk.", cap: "One of the risk surfaces TrustX adds. Components such as a procurement dossier tailor the classification to each surface." },
    { id: "wg", kind: "fact", name: "TrustX for Finance Working Group", nar: [0.17, 0.86],
      title: "TrustX for Finance Working Group.", cap: "ROAR was introduced as part of the working group's launch." },
    { id: "controls", kind: "fact", name: "Control recommendations", nar: [0.85, 0.44],
      title: "Control recommendations.", cap: "ARC outputs will inform mapped control recommendations in RAI's policy generator tool." },
    { id: "legacy", kind: "fact", name: "Exposure risk to legacy systems", nar: [0.85, 0.635],
      title: "Exposure risk to legacy systems.", cap: "The other risk surface TrustX adds to ARC." },
    { id: "apps", kind: "fact", name: "Contributed AI applications", nar: [0.83, 0.86],
      title: "Contributed AI applications.", cap: "Individuals add their AI applications to ROAR to see how they map to TrustX." },
  ];
  const STD = [
    ["nist", "NIST AI RMF", 165], ["eu", "EU AI Act", 133], ["owasp", "OWASP", 105],
    ["mitre", "MITRE ATLAS", 75], ["iso", "ISO/IEC 42001", 47], ["sr", "SR 11-7/26-2", 15],
  ];
  STD.forEach(([id, name, deg]) => {
    const a = deg * Math.PI / 180;
    N.push({ id, kind: "std", name, fx: Math.cos(a), fy: -Math.sin(a), title: name + ".", cap: "One of the established frameworks ARC is grounded in." });
  });
  const byId = Object.fromEntries(N.map(n => [n.id, n]));

  const E = [
    ["arc", "trustx", "chain"], ["trustx", "roar", "chain"],
    ...STD.map(s => [s[0], "arc", "ground"]),
    ["types", "arc", "fact"], ["arc", "dims", "fact"], ["dims", "trustx", "fact"], ["arc", "controls", "fact"],
    ["trustx", "procure", "fact"], ["trustx", "legacy", "fact"], ["wg", "roar", "fact"], ["apps", "roar", "fact"],
  ].map(([a, b, kind]) => ({ a: byId[a], b: byId[b], kind }));
  N.forEach(n => (n.nb = new Set()));
  E.forEach(e => { e.a.nb.add(e.b.id); e.b.nb.add(e.a.id); });

  // Faint fractal twigs on component nodes (angles set per layout).
  function makeTwigs(base) {
    const out = [];
    const grow = (x, y, ang, depth) => {
      if (depth > 2) return;
      const len = (depth === 1 ? 16 : 10) * (0.85 + rand() * 0.3);
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      out.push({ x1: x, y1: y, x2, y2, depth });
      const s = 0.38 + rand() * 0.08;
      grow(x2, y2, ang - s, depth + 1); grow(x2, y2, ang + s, depth + 1);
    };
    [-0.32, 0.32].forEach(d => grow(0, 0, base + d, 1));
    return out;
  }
  N.forEach(n => {
    n.ph = rand() * Math.PI * 2; n.w = 0.25 + rand() * 0.3; n.amp = n.kind === "core" ? 0.8 : 1.3;
  });

  // ----- Layout -----
  const RAD = { core: 6.5, std: 4, fact: 3.2 };
  let W = 0, H = 0, dpr = 1, animating = false, wide = true;
  let FS = {}, labels = [];
  const fontFor = kind => kind === "core" ? `500 ${FS.core}px "IBM Plex Mono", ui-monospace, monospace`
    : kind === "std" ? `400 ${FS.std}px "IBM Plex Mono", ui-monospace, monospace`
    : `italic 400 ${FS.fact}px "Newsreader", Georgia, serif`;
  function wrapLabel(text, maxW) {
    const words = text.split(" "), lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    lines.push(line);
    return lines;
  }
  const labelText = n => (n.kind === "core" ? n.name.toUpperCase() : n.name);

  function place() {
    const cr = canvas.getBoundingClientRect();
    if (wide) {
      // Diamonds sit exactly above the centre of each spotlight column.
      const xs = cols.map(c => { const r = c.getBoundingClientRect(); return (r.left + r.width / 2 - cr.left) / W; });
      const [a, t, r] = xs, cy = 0.56;
      const P = {
        arc: [a, cy], trustx: [t, cy], roar: [r, cy],
        types: [a - 0.1, 0.8], controls: [a + 0.11, 0.8],
        dims: [(a + t) / 2 + 0.02, 0.26],
        procure: [t - 0.1, 0.8], legacy: [t + 0.11, 0.8],
        wg: [r - 0.11, 0.26], apps: [r + 0.07, 0.8],
      };
      for (const n of N) {
        if (n.kind === "std") { n.bx = (a + n.fx * 0.115) * W; n.by = (cy + n.fy * 0.44) * H; }
        else { n.bx = P[n.id][0] * W; n.by = P[n.id][1] * H; }
      }
    } else {
      for (const n of N) {
        if (n.kind === "std") { n.bx = W * (0.5 + n.fx * 0.36); n.by = H * 0.36 + n.fy * H * 0.26; }
        else { n.bx = n.nar[0] * W; n.by = n.nar[1] * H; }
      }
    }
    seed = 19;
    for (const n of N) if (n.kind === "fact") {
      const base = wide ? (n.by < H * 0.5 ? -Math.PI / 2 : Math.PI / 2 + 0.0) + (n.bx < W / 2 ? -0.35 : 0.35) * (n.by < H * 0.5 ? 1 : -1)
                        : (n.bx < W / 2 ? Math.PI + 0.5 : -0.5);
      n.twigs = makeTwigs(base);
    }
  }

  function layout() {
    wide = wideMQ.matches;
    FS = wide
      ? { std: 10.5, fact: Math.max(12, Math.min(14, W / 80)), core: 13 }
      : { std: Math.max(8.5, Math.min(10.5, W / 54)), fact: Math.max(11, Math.min(13.5, W / 42)), core: Math.max(11, Math.min(13, W / 44)) };
    const wrapW = wide ? Math.min(150, W * 0.13) : Math.max(90, Math.min(150, W * 0.3));
    place();
    labels = N.map(n => {
      ctx.font = fontFor(n.kind);
      const lh = FS[n.kind] * 1.18;
      const lines = n.kind === "fact" ? wrapLabel(labelText(n), wrapW) : [labelText(n)];
      const w = Math.max(...lines.map(l => ctx.measureText(l).width));
      const h = lines.length * lh;
      let ox = -w / 2, oy;
      if (n.kind === "std") oy = -(RAD.std + 5 + h);
      else if (n.kind === "core" && wide) { ox = 12; oy = -h - 6; }
      else oy = RAD[n.kind] + 6;
      const l = { n, lines, w, h, lh, ox, oy };
      n.label = l;
      return l;
    });
    relax();
  }
  const box = l => ({ x: l.n.bx + l.ox, y: l.n.by + l.oy, w: l.w, h: l.h });
  function relax() {
    const PAD = 3, M = 3;
    for (let it = 0; it < 80; it++) {
      let moved = false;
      for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i], b = labels[j], A = box(a), B = box(b);
        const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) + PAD;
        const oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) + PAD;
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        if (oy < ox) { const d = A.y + A.h / 2 < B.y + B.h / 2 ? -1 : 1; a.oy += d * oy / 2; b.oy -= d * oy / 2; }
        else { const d = A.x + A.w / 2 < B.x + B.w / 2 ? -1 : 1; a.ox += d * ox / 2; b.ox -= d * ox / 2; }
      }
      for (const l of labels) {
        for (const n of N) {
          if (n === l.n) continue;
          const B = box(l), r = RAD[n.kind] + 3;
          if (n.bx > B.x - r && n.bx < B.x + B.w + r && n.by > B.y - r && n.by < B.y + B.h + r) {
            moved = true;
            if (n.by < B.y + B.h / 2) l.oy += (n.by + r) - B.y; else l.oy -= (B.y + B.h) - (n.by - r);
          }
        }
        const B = box(l);
        if (B.x < M) l.ox += M - B.x;
        if (B.x + B.w > W - M) l.ox -= B.x + B.w - (W - M);
        if (B.y < M) l.oy += M - B.y;
        if (B.y + B.h > H - M) l.oy -= B.y + B.h - (H - M);
      }
      if (!moved) break;
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    if (!animating) draw(performance.now());
  }

  const C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    ["bg", "fg", "muted", "line", "accent"].forEach(k => (C[k] = s.getPropertyValue("--" + k).trim()));
  }

  // ----- Highlight -----
  let active = null;
  function nodeOn(n) {
    if (!active) return true;
    if (active.type === "node") return n.id === active.id || n.nb.has(active.id);
    if (n.kind === active.kind) return true;
    return active.kind !== "core" && [...n.nb].some(id => byId[id].kind === active.kind);
  }
  function edgeOn(e) {
    if (!active) return true;
    if (active.type === "node") return e.a.id === active.id || e.b.id === active.id;
    if (active.kind === "core") return e.a.kind === "core" && e.b.kind === "core";
    return e.a.kind === active.kind || e.b.kind === active.kind;
  }
  const dim = on => (on ? 1 : 0.13);

  // ----- Pulses -----
  const pulses = [];
  const stdNodes = N.filter(n => n.kind === "std");
  let lastSpawn = 0;
  function spawnPulse(now) {
    if (pulses.length >= 4) return;
    let path;
    if (rand() < 0.4) path = [stdNodes[Math.floor(rand() * stdNodes.length)], byId.arc, byId.trustx, byId.roar];
    else { const e = E[Math.floor(rand() * E.length)]; path = [e.a, e.b]; }
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) segs.push(E.find(e => e.a === path[i] && e.b === path[i + 1]));
    pulses.push({ path, segs, start: now, dur: 1500 * (path.length - 1) + 900 });
  }
  function polyPoint(path, s) {
    const segs = path.length - 1, f = Math.min(s * segs, segs - 1e-6), i = Math.floor(f), k = f - i;
    const a = path[i], b = path[i + 1];
    return [a.px + (b.px - a.px) * k, a.py + (b.py - a.py) * k, i];
  }

  // ----- Draw -----
  const t0 = performance.now();
  const ease = x => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  const clamp01 = x => Math.min(Math.max(x, 0), 1);
  function withAlpha(color, a) { ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.fillStyle = color; }
  function haloText(text, x, y, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = C.bg;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  const STAGE = { ground: 0, chain: 0.7, fact: 1.4 };

  function draw(now) {
    readColors();
    const t = now / 1000, still = reduce.matches;
    for (const n of N) {
      n.px = n.bx + (still ? 0 : Math.sin(t * n.w + n.ph) * n.amp);
      n.py = n.by + (still ? 0 : Math.cos(t * n.w * 0.83 + n.ph * 1.3) * n.amp);
    }
    const g = still ? 1 : ease((now - t0) / 1800);
    const grown = g * 2.6;
    ctx.clearRect(0, 0, W, H);

    // Drop lines from each diamond into its column (wide only)
    if (wide) {
      ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
      for (const n of N) if (n.kind === "core") {
        withAlpha(C.accent, 0.5 * ease(grown - 1.2) * dim(nodeOn(n)));
        ctx.beginPath(); ctx.moveTo(n.bx, n.py + RAD.core + 4); ctx.lineTo(n.bx, H); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Twigs
    for (const n of N) if (n.twigs) for (const tw of n.twigs) {
      const k = clamp01(grown - 1.6 - (tw.depth - 1) * 0.3);
      if (k <= 0) continue;
      ctx.lineWidth = tw.depth === 1 ? 0.9 : 0.7;
      withAlpha(C.line, (tw.depth === 1 ? 0.55 : 0.4) * dim(nodeOn(n)));
      const x1 = n.px + tw.x1, y1 = n.py + tw.y1, x2 = n.px + tw.x2, y2 = n.py + tw.y2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k); ctx.stroke();
      if (k >= 1 && tw.depth === 2) { ctx.beginPath(); ctx.arc(x2, y2, 1.1, 0, Math.PI * 2); ctx.fill(); }
    }

    // Edges
    for (const e of E) {
      const k = clamp01(grown - STAGE[e.kind]);
      if (k <= 0) continue;
      const on = edgeOn(e), lit = on && active;
      if (e.kind === "chain") { ctx.lineWidth = 1.6; withAlpha(C.accent, 0.85 * dim(on)); }
      else { ctx.lineWidth = lit ? 1.3 : 1; withAlpha(lit ? C.accent : C.line, (lit ? 0.9 : 0.6) * dim(on)); }
      ctx.beginPath();
      ctx.moveTo(e.a.px, e.a.py);
      ctx.lineTo(e.a.px + (e.b.px - e.a.px) * k, e.a.py + (e.b.py - e.a.py) * k);
      ctx.stroke();
      if (e.kind === "chain" && k >= 1) {
        const mx = e.a.px + (e.b.px - e.a.px) * 0.5, my = e.a.py + (e.b.py - e.a.py) * 0.5;
        const ang = Math.atan2(e.b.py - e.a.py, e.b.px - e.a.px), s = 4.5;
        ctx.beginPath();
        ctx.moveTo(mx + Math.cos(ang + 2.5) * s, my + Math.sin(ang + 2.5) * s);
        ctx.lineTo(mx, my);
        ctx.lineTo(mx + Math.cos(ang - 2.5) * s, my + Math.sin(ang - 2.5) * s);
        ctx.stroke();
      }
    }

    // Pulses
    if (!still && g >= 1) {
      if (now - lastSpawn > 1300) { spawnPulse(now); lastSpawn = now; }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], s = (now - p.start) / p.dur;
        if (s >= 1) { pulses.splice(i, 1); continue; }
        const fade = Math.sin(Math.PI * s);
        for (let j = 0; j < 4; j++) {
          const [x, y, seg] = polyPoint(p.path, Math.max(s - j * 0.02, 0));
          const e = p.segs[seg];
          withAlpha(e.kind === "chain" ? C.accent : C.muted, fade * (0.75 - j * 0.17) * dim(edgeOn(e)));
          ctx.beginPath(); ctx.arc(x, y, 2.1 - j * 0.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // Nodes
    const nk = ease(grown - 0.2);
    for (const n of N) {
      const on = nodeOn(n), big = active && active.type === "node" && active.id === n.id;
      ctx.globalAlpha = nk * dim(on);
      if (n.kind === "core") {
        const s = big ? RAD.core + 1.5 : RAD.core;
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.moveTo(n.px, n.py - s); ctx.lineTo(n.px + s, n.py); ctx.lineTo(n.px, n.py + s); ctx.lineTo(n.px - s, n.py);
        ctx.closePath(); ctx.fill();
      } else if (n.kind === "std") {
        ctx.fillStyle = C.bg; ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(n.px, n.py, big ? RAD.std + 1 : RAD.std, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (active && on) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(n.px, n.py, 1.8, 0, Math.PI * 2); ctx.fill(); }
      } else {
        ctx.fillStyle = active && on ? C.accent : C.line;
        ctx.beginPath(); ctx.arc(n.px, n.py, big ? RAD.fact + 1 : RAD.fact, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Labels
    const lk = ease(grown - 0.9);
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (const l of labels) {
      const n = l.n, on = nodeOn(n);
      ctx.font = fontFor(n.kind);
      const color = n.kind === "core" ? C.accent : n.kind === "std" ? C.muted : C.fg;
      const x = n.px + l.ox + l.w / 2, y = n.py + l.oy;
      l.lines.forEach((ln, i) => haloText(ln, x, y + i * l.lh, color, lk * dim(on)));
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    draw(now);
    if (!reduce.matches) requestAnimationFrame(frame); else animating = false;
  }
  function start() {
    if (!reduce.matches && !animating) { animating = true; requestAnimationFrame(frame); }
    else draw(performance.now());
  }

  // ----- Interaction -----
  const legend = document.getElementById("legend");
  const GROUP_CAP = {
    core: "<strong>RAI frameworks.</strong> ARC, the TrustX expanded framework and ROAR, each building on the one before.",
    std: "<strong>Grounded in.</strong> The established frameworks ARC draws on.",
    fact: "<strong>Components.</strong> What each framework covers, adds or feeds into.",
  };
  function setActive(a) {
    active = a;
    if (!a) capEl.innerHTML = DEFAULT_CAP;
    else if (a.type === "group") capEl.innerHTML = GROUP_CAP[a.kind];
    else { const n = byId[a.id]; capEl.innerHTML = `<strong>${n.title}</strong> ${n.cap}` + (n.href ? ` <a href="${n.href}">Read more</a>` : ""); }
    spot.classList.toggle("dim", !!a);
    cols.forEach(li => li.classList.toggle("on", !!a && nodeOn(byId[li.dataset.node])));
    legend.querySelectorAll("button").forEach(b => b.classList.toggle("on", !!a && a.type === "group" && a.kind === b.dataset.group));
    if (!animating) draw(performance.now());
  }
  const same = (a, b) => (!a && !b) || (a && b && a.type === b.type && a.id === b.id && a.kind === b.kind);
  function hit(x, y) {
    for (const n of N) if (Math.hypot(x - n.px, y - n.py) < 13) return { type: "node", id: n.id };
    for (const l of labels) {
      const bx = l.n.px + l.ox, by = l.n.py + l.oy;
      if (x > bx - 4 && x < bx + l.w + 4 && y > by - 3 && y < by + l.h + 3) return { type: "node", id: l.n.id };
    }
    return null;
  }
  const hitAt = e => { const r = canvas.getBoundingClientRect(); return hit(e.clientX - r.left, e.clientY - r.top); };
  canvas.addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    const h = hitAt(e);
    canvas.style.cursor = h && byId[h.id].href ? "pointer" : "default";
    if (!same(h, active)) setActive(h);
  });
  canvas.addEventListener("pointerleave", e => { if (e.pointerType !== "touch") setActive(null); });
  let downType = "mouse", downActive = null;
  canvas.addEventListener("pointerdown", e => { downType = e.pointerType; downActive = active; });
  canvas.addEventListener("click", e => {
    const h = hitAt(e);
    if (downType === "touch" && !same(h, downActive)) { setActive(h); return; }
    if (h && byId[h.id].href) location.hash = byId[h.id].href.slice(1);
  });
  cols.forEach(li => {
    const on = () => setActive({ type: "node", id: li.dataset.node });
    li.addEventListener("mouseenter", on);
    li.addEventListener("focusin", on);
    li.addEventListener("mouseleave", () => setActive(null));
    li.addEventListener("focusout", () => setActive(null));
  });
  legend.querySelectorAll("button").forEach(b => {
    const on = () => setActive({ type: "group", kind: b.dataset.group });
    b.addEventListener("mouseenter", on);
    b.addEventListener("focus", on);
    b.addEventListener("mouseleave", () => setActive(null));
    b.addEventListener("blur", () => setActive(null));
    b.addEventListener("click", () => setActive(b.classList.contains("on") ? null : { type: "group", kind: b.dataset.group }));
  });

  new ResizeObserver(resize).observe(canvas);
  new ResizeObserver(() => { layout(); if (!animating) draw(performance.now()); }).observe(spot);
  wideMQ.addEventListener?.("change", resize);
  reduce.addEventListener?.("change", start);
  const redraw = () => { if (!animating) draw(performance.now()); };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.fonts?.ready.then(() => { layout(); redraw(); });
  resize();
  start();
})();
