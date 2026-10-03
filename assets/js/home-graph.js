// Homepage graph: the fields grow as fractal trees on a ring; research areas (gold) and RAI projects
// (navy diamonds) sit inside, linked to the fields they draw on. Hover to preview, click to pin a node
// and list where it comes up on the site. Data comes from content/_index.md via #graph-data.
(() => {
  const canvas = document.getElementById("graph");
  const dataEl = document.getElementById("graph-data");
  if (!canvas || !dataEl) return;
  const { fields: FIELDS, areas: INNER } = JSON.parse(dataEl.textContent);
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mentionsEl = document.getElementById("mentions");
  const DEFAULT_MENTIONS = mentionsEl.innerHTML;
  const legend = document.getElementById("legend");
  const items = [...document.querySelectorAll(".item[data-i]")];
  const lists = [document.getElementById("topics"), document.getElementById("projects")].filter(Boolean);

  // Seeded RNG so the fractal looks the same on every visit.
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ----- Build graph in unit coordinates (ring radius = 1) -----
  const nodes = [], branchEdges = [], crossEdges = [], innerEdges = [];
  const STEP = Math.PI * 2 / FIELDS.length;
  const hubs = FIELDS.map((f, i) => {
    const a = -Math.PI / 2 + i * STEP;
    const n = { kind: "hub", field: f.id, name: f.name, x: Math.cos(a), y: Math.sin(a), ang: a, depth: 0, children: [] };
    nodes.push(n);
    return n;
  });
  // Branch size and spread scale with the number of fields, so fewer fields still fill the ring.
  const SCALE = Math.min(1.5, 9 / FIELDS.length);
  const LENS = [0.25, 0.155, 0.1].map(l => l * Math.pow(SCALE, 0.15));
  const EXTENT = 1 + LENS.reduce((a, b) => a + b, 0) + 0.07;
  function grow(parent, ang, depth) {
    if (depth > 3) return;
    const len = LENS[depth - 1] * (0.85 + rand() * 0.3);
    const n = { kind: "twig", field: parent.field, depth, children: [],
      x: parent.x + Math.cos(ang) * len, y: parent.y + Math.sin(ang) * len };
    nodes.push(n);
    parent.children.push(n);
    branchEdges.push({ a: parent, b: n, depth, field: parent.field });
    const spread = (0.34 + rand() * 0.07) * Math.pow(SCALE, 0.6);
    grow(n, ang - spread + (rand() - .5) * .12, depth + 1);
    grow(n, ang + spread + (rand() - .5) * .12, depth + 1);
  }
  hubs.forEach(h => [-0.36, 0, 0.36].map(d => d * Math.pow(SCALE, 0.8)).forEach(d => grow(h, h.ang + d + (rand() - .5) * .08, 1)));

  // Dashed links between leaves of neighbouring fields that reach toward each other.
  const leaves = f => nodes.filter(n => n.field === f && n.depth === 3);
  hubs.forEach((h, i) => {
    const next = hubs[(i + 1) % hubs.length];
    const pairs = [];
    leaves(h.field).forEach(a => leaves(next.field).forEach(b => pairs.push({ a, b, d: Math.hypot(a.x - b.x, a.y - b.y) })));
    pairs.sort((p, q) => p.d - q.d);
    const used = new Set();
    let count = 0;
    for (const p of pairs) {
      if (count >= 2) break;
      if (used.has(p.a) || used.has(p.b) || p.d > 0.5 * SCALE) continue;
      used.add(p.a); used.add(p.b); count++;
      crossEdges.push({ a: p.a, b: p.b, fields: [h.field, next.field] });
    }
  });

  // Inner nodes start at the centroid of their fields, then spread apart so labels don't collide.
  const hubById = Object.fromEntries(hubs.map(h => [h.field, h]));
  const innerNodes = INNER.map((it, i) => {
    const hs = it.fields.map(id => hubById[id]).filter(Boolean);
    const tx = hs.reduce((s, h) => s + h.x, 0) / (hs.length || 1) * .8;
    const ty = hs.reduce((s, h) => s + h.y, 0) / (hs.length || 1) * .8;
    const n = { kind: it.kind, index: i, name: it.name, x: tx, y: ty, tx, ty, depth: 0 };
    nodes.push(n);
    hs.forEach(h => innerEdges.push({ a: h, b: n, field: h.field, index: i }));
    return n;
  });
  for (let it = 0; it < 400; it++) {
    for (let i = 0; i < innerNodes.length; i++) for (let j = i + 1; j < innerNodes.length; j++) {
      const a = innerNodes[i], b = innerNodes[j];
      const minD = a.kind === "topic" && b.kind === "topic" ? 0.52 : 0.4;
      let dx = b.x - a.x, dy = (b.y - a.y) * 1.25;
      const d = Math.hypot(dx, dy) || 1e-3;
      if (d < minD) {
        const push = (minD - d) / 2;
        dx /= d; dy /= d;
        a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push;
      }
    }
    for (const n of innerNodes) {
      // Field labels sit just inside each hub; push inner nodes (and the label below them) away.
      for (const h of hubs) {
        const lx = h.x * 0.84, ly = h.y * 0.84;
        let dx = n.x - lx, dy = (n.y + (n.kind === "topic" ? 0.12 : 0.05)) - ly;
        const d = Math.hypot(dx, dy) || 1e-3, minD = n.kind === "topic" ? 0.36 : 0.26;
        if (d < minD) { n.x += dx / d * (minD - d) * 0.5; n.y += dy / d * (minD - d) * 0.5; }
      }
      n.x += (n.tx - n.x) * 0.02; n.y += (n.ty - n.y) * 0.02;
      const r = Math.hypot(n.x, n.y), max = 0.72;
      if (r > max) { n.x *= max / r; n.y *= max / r; }
    }
  }
  nodes.forEach(n => {
    n.phase = rand() * Math.PI * 2;
    n.w = 0.25 + rand() * 0.3;
    n.amp = n.kind === "twig" ? 1.6 : 1.1;
  });

  // ----- Sizing -----
  let W = 0, H = 0, R = 0, cx = 0, cy = 0;
  let animating = false;
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) / 2 / EXTENT;
    cx = W / 2; cy = H / 2;
    relaxLabels();
    if (!animating) draw(performance.now());
  }

  const C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    ["bg", "fg", "line", "accent", "accent-2"].forEach(k => (C[k] = s.getPropertyValue("--" + k).trim()));
  }

  // ----- Highlight state -----
  // null | {type:'field', id} | {type:'inner', index} | {type:'group', kind:'field'|'topic'|'project'}
  let active = null, pinned = null;
  function fieldOn(id) {
    if (!active) return true;
    if (active.type === "field") return active.id === id;
    if (active.type === "inner") return INNER[active.index].fields.includes(id);
    if (active.kind === "field") return true;
    return INNER.some(it => it.kind === active.kind && it.fields.includes(id));
  }
  function innerOn(i) {
    if (!active) return true;
    if (active.type === "inner") return active.index === i;
    if (active.type === "field") return INNER[i].fields.includes(active.id);
    return INNER[i].kind === active.kind;
  }
  function edgeOn(e) {
    if (!active) return true;
    if (active.type === "field") return active.id === e.field;
    if (active.type === "inner") return active.index === e.index;
    return INNER[e.index].kind === active.kind;
  }
  const dim = on => (on ? 1 : 0.12);

  // ----- Pulses -----
  const pulses = [];
  let lastSpawn = 0;
  function spawnPulse(now) {
    if (pulses.length >= 5) return;
    if (innerEdges.length && rand() < 0.55) {
      const e = innerEdges[Math.floor(rand() * innerEdges.length)];
      pulses.push({ kind: "inner", edge: e, start: now, dur: 2600 + rand() * 900, rev: rand() < .5 });
    } else {
      let n = hubs[Math.floor(rand() * hubs.length)];
      const path = [n];
      while (n.children.length) { n = n.children[Math.floor(rand() * n.children.length)]; path.push(n); }
      pulses.push({ kind: "branch", path, start: now, dur: 2400 + rand() * 800 });
    }
  }

  // ----- Geometry -----
  function place(now) {
    const t = now / 1000, still = reduce.matches;
    for (const n of nodes) {
      n.px = cx + n.x * R + (n.dx || 0) + (still ? 0 : Math.sin(t * n.w + n.phase) * n.amp);
      n.py = cy + n.y * R + (n.dy || 0) + (still ? 0 : Math.cos(t * n.w * 0.83 + n.phase * 1.3) * n.amp);
    }
  }
  function curvePoint(a, b, s) {
    const mx = (a.px + b.px) / 2, my = (a.py + b.py) / 2;
    const qx = cx + (mx - cx) * 0.78, qy = cy + (my - cy) * 0.78, u = 1 - s;
    return [u * u * a.px + 2 * u * s * qx + s * s * b.px, u * u * a.py + 2 * u * s * qy + s * s * b.py];
  }
  function polyPoint(path, s) {
    const segs = path.length - 1, f = Math.min(s * segs, segs - 1e-6), i = Math.floor(f), k = f - i;
    const a = path[i], b = path[i + 1];
    return [a.px + (b.px - a.px) * k, a.py + (b.py - a.py) * k];
  }
  const hubLabelPos = h => [h.px - Math.cos(h.ang) * 20, h.py - Math.sin(h.ang) * 20];

  // ----- Label sizes and pixel-space collision pass -----
  const sizes = () => ({
    fs: Math.max(9, Math.min(10.5, R / 18)),
    tfs: Math.max(11.5, Math.min(15, R / 13)),
    pfs: Math.max(9.5, Math.min(11, R / 17)),
    wrap: Math.max(R * 0.6, 88),
  });
  // On small screens there is no room for every label: inner labels show only for the selected node.
  const compact = () => R < 150;
  const showLabel = n => !compact() || (active && active.type === "inner" && active.index === n.index);
  function innerBox(n, S) {
    if (compact()) return { w: 16, top: -9, bottom: 9 };
    if (n.kind === "topic") {
      ctx.font = `italic 400 ${S.tfs}px "Newsreader", Georgia, serif`;
      const lines = wrapLabel(n.name, S.wrap);
      const w = Math.max(...lines.map(l => ctx.measureText(l).width), 14);
      return { w, top: -9, bottom: 16 + lines.length * S.tfs * 1.12 };
    }
    ctx.font = `500 ${S.pfs}px "IBM Plex Mono", ui-monospace, monospace`;
    return { w: Math.max(ctx.measureText(n.name.toUpperCase()).width, 14), top: -9, bottom: 22 };
  }
  // Nudges research areas and projects (with their labels) off the field labels and each other.
  function relaxLabels() {
    const S = sizes(), PAD = 7;
    ctx.font = `500 ${S.fs}px "IBM Plex Mono", ui-monospace, monospace`;
    const fixed = hubs.map(h => {
      const lx = cx + h.x * R - Math.cos(h.ang) * 20, ly = cy + h.y * R - Math.sin(h.ang) * 20;
      const lines = h.name.toUpperCase().split(" ");
      const w = Math.max(...lines.map(l => ctx.measureText(l).width));
      const hh = lines.length * S.fs * 1.2;
      const x0 = Math.min(lx - w / 2, cx + h.x * R - 7), x1 = Math.max(lx + w / 2, cx + h.x * R + 7);
      const y0 = Math.min(ly - hh / 2, cy + h.y * R - 7), y1 = Math.max(ly + hh / 2, cy + h.y * R + 7);
      return { x0, x1, y0, y1 };
    });
    const mov = innerNodes.map(n => { n.dx = 0; n.dy = 0; return { n, b: innerBox(n, S) }; });
    const rect = m => {
      const x = cx + m.n.x * R + m.n.dx, y = cy + m.n.y * R + m.n.dy;
      return { x0: x - m.b.w / 2 - PAD, x1: x + m.b.w / 2 + PAD, y0: y + m.b.top - PAD, y1: y + m.b.bottom + PAD };
    };
    const overlap = (A, B) => [Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0)];
    const push = (m, A, B, share) => {
      const [ox, oy] = overlap(A, B);
      if (ox <= 0 || oy <= 0) return false;
      if (oy < ox) m.n.dy += ((A.y0 + A.y1) < (B.y0 + B.y1) ? -1 : 1) * oy * share;
      else m.n.dx += ((A.x0 + A.x1) < (B.x0 + B.x1) ? -1 : 1) * ox * share;
      return true;
    };
    for (let it = 0; it < 300; it++) {
      let moved = false;
      for (const m of mov) for (const F of fixed) moved = push(m, rect(m), F, 0.6) || moved;
      for (let i = 0; i < mov.length; i++) for (let j = i + 1; j < mov.length; j++) {
        const A = rect(mov[i]), B = rect(mov[j]);
        if (push(mov[i], A, B, 0.5)) { push(mov[j], B, A, 0.5); moved = true; }
      }
      for (const m of mov) { // stay inside the ring
        const x = m.n.x * R + m.n.dx, y = m.n.y * R + m.n.dy, r = Math.hypot(x, y), max = R * 0.84;
        if (r > max) { m.n.dx = x * max / r - m.n.x * R; m.n.dy = y * max / r - m.n.y * R; }
      }
      if (!moved) break;
    }
    // Final pass: field labels always win, even if that nudges two inner labels closer.
    for (let it = 0; it < 40; it++) {
      let moved = false;
      for (const m of mov) for (const F of fixed) moved = push(m, rect(m), F, 1) || moved;
      if (!moved) break;
    }
  }

  // ----- Draw -----
  const t0 = performance.now();
  const ease = x => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  function withAlpha(color, a) { ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.fillStyle = color; }
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
  function haloText(text, x, y, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = C.bg;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  const edgeColor = e => (INNER[e.index].kind === "topic" ? C["accent-2"] : C.accent);

  function draw(now) {
    readColors();
    place(now);
    const g = reduce.matches ? 1 : ease((now - t0) / 1800);
    const grown = g * 4;
    ctx.clearRect(0, 0, W, H);

    ctx.setLineDash([2, 4]); ctx.lineWidth = 1;
    for (const e of crossEdges) {
      withAlpha(C.line, 0.55 * ease(grown - 3.2) * dim(fieldOn(e.fields[0]) || fieldOn(e.fields[1])));
      ctx.beginPath(); ctx.moveTo(e.a.px, e.a.py); ctx.lineTo(e.b.px, e.b.py); ctx.stroke();
    }
    ctx.setLineDash([]);

    for (const e of branchEdges) {
      const k = Math.min(Math.max(grown - (e.depth - 1), 0), 1);
      if (k <= 0) continue;
      const on = fieldOn(e.field);
      ctx.lineWidth = 1.6 - e.depth * 0.35;
      withAlpha(on && active ? C.accent : C.line, (0.95 - e.depth * 0.18) * dim(on));
      ctx.beginPath();
      ctx.moveTo(e.a.px, e.a.py);
      ctx.lineTo(e.a.px + (e.b.px - e.a.px) * k, e.a.py + (e.b.py - e.a.py) * k);
      ctx.stroke();
    }

    const tk = ease((g - 0.45) / 0.55);
    if (tk > 0) for (const e of innerEdges) {
      const on = edgeOn(e);
      ctx.lineWidth = on && active ? 1.4 : 1;
      withAlpha(edgeColor(e), (active ? 0.9 : 0.4) * tk * dim(on));
      ctx.beginPath();
      const steps = 24;
      for (let i = 0; i <= steps * tk; i++) {
        const [x, y] = curvePoint(e.a, e.b, i / steps);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }

    if (!reduce.matches && g >= 1) {
      if (now - lastSpawn > 1100) { spawnPulse(now); lastSpawn = now; }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], s = (now - p.start) / p.dur;
        if (s >= 1) { pulses.splice(i, 1); continue; }
        const on = p.kind === "inner" ? edgeOn(p.edge) : fieldOn(p.path[0].field);
        const fade = Math.sin(Math.PI * s);
        const color = p.kind === "inner" ? edgeColor(p.edge) : C.accent;
        for (let j = 0; j < 4; j++) {
          const ss = Math.max(s - j * 0.025, 0);
          const [x, y] = p.kind === "inner" ? curvePoint(p.edge.a, p.edge.b, p.rev ? 1 - ss : ss) : polyPoint(p.path, ss);
          withAlpha(color, fade * (0.8 - j * 0.18) * dim(on));
          ctx.beginPath(); ctx.arc(x, y, 2.2 - j * 0.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    for (const n of nodes) {
      if (n.kind !== "twig" || grown - (n.depth - 1) < 1) continue;
      const on = fieldOn(n.field);
      withAlpha(on && active ? C.accent : C.line, dim(on));
      ctx.beginPath(); ctx.arc(n.px, n.py, 2.6 - n.depth * 0.5, 0, Math.PI * 2); ctx.fill();
    }

    const S = sizes(), fs = S.fs;
    ctx.font = `500 ${fs}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const h of hubs) {
      const on = fieldOn(h.field);
      ctx.globalAlpha = dim(on);
      ctx.fillStyle = C.bg; ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(h.px, h.py, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (active && on) { ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(h.px, h.py, 2.4, 0, Math.PI * 2); ctx.fill(); }
      const [lx, ly] = hubLabelPos(h);
      const lines = h.name.toUpperCase().split(" ");
      const off = (lines.length - 1) * fs * 0.6;
      lines.forEach((ln, i) => haloText(ln, lx, ly - off + i * fs * 1.2, C.accent, dim(on) * ease(grown - 0.5)));
    }

    if (tk > 0) {
      const tfs = S.tfs, pfs = S.pfs;
      for (const n of innerNodes) {
        const on = innerOn(n.index);
        const big = active && active.type === "inner" && active.index === n.index;
        if (n.kind === "topic") {
          withAlpha(C["accent-2"], tk * dim(on));
          ctx.beginPath(); ctx.arc(n.px, n.py, big ? 7 : 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.font = `italic 400 ${tfs}px "Newsreader", Georgia, serif`;
          const lines = wrapLabel(n.name, S.wrap);
          if (showLabel(n)) lines.forEach((ln, i) => haloText(ln, n.px, n.py + 16 + i * tfs * 1.12, C.fg, tk * dim(on)));
          n.labelTop = n.py; n.labelH = 16 + lines.length * tfs * 1.12;
          n.labelW = Math.max(...lines.map(l => ctx.measureText(l).width));
        } else {
          const s = big ? 7 : 5.5;
          withAlpha(C.accent, tk * dim(on));
          ctx.beginPath();
          ctx.moveTo(n.px, n.py - s); ctx.lineTo(n.px + s, n.py); ctx.lineTo(n.px, n.py + s); ctx.lineTo(n.px - s, n.py);
          ctx.closePath(); ctx.fill();
          ctx.font = `500 ${pfs}px "IBM Plex Mono", ui-monospace, monospace`;
          if (showLabel(n)) haloText(n.name.toUpperCase(), n.px, n.py + 15, C.accent, tk * dim(on));
          n.labelTop = n.py; n.labelH = 22; n.labelW = ctx.measureText(n.name.toUpperCase()).width;
        }
      }
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

  // ----- Mentions panel -----
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function showMentions(a) {
    if (!a) { mentionsEl.innerHTML = DEFAULT_MENTIONS; return; }
    if (a.type === "inner") {
      const it = INNER[a.index];
      const links = (it.mentions || []).map(m => `<li><a href="${esc(m.url)}">${esc(m.label)}</a></li>`).join("");
      mentionsEl.innerHTML = `<strong>${esc(it.name)}</strong> comes up in:` + (links ? `<ul>${links}</ul>` : " nowhere else yet.");
    } else if (a.type === "field") {
      const name = FIELDS.find(f => f.id === a.id).name;
      const users = INNER.filter(it => it.fields.includes(a.id)).map(it => esc(it.name));
      mentionsEl.innerHTML = `<strong>${esc(name)}</strong> feeds into ` + (users.length ? users.join(", ") + "." : "work that isn't listed here yet.");
    } else {
      mentionsEl.innerHTML = DEFAULT_MENTIONS;
    }
  }

  // ----- Interaction -----
  function setActive(a) {
    active = a;
    items.forEach(el => el.classList.toggle("on", !!a && innerOn(+el.dataset.i)));
    lists.forEach(l => l.classList.toggle("dim", !!a));
    legend.querySelectorAll("button").forEach(b => b.classList.toggle("on", !!a && a.type === "group" && a.kind === b.dataset.group));
    canvas.style.cursor = a ? "pointer" : "default";
    if (!animating) draw(performance.now());
  }
  const same = (a, b) => (!a && !b) || (!!a && !!b && a.type === b.type && a.id === b.id && a.index === b.index && a.kind === b.kind);
  // Hovering previews; leaving returns to whatever is pinned.
  const preview = a => { setActive(a || pinned); if (!pinned) showMentions(a); };
  const pin = a => { pinned = a; setActive(a); showMentions(a); };

  lists.forEach(l => {
    const pick = e => { const el = e.target.closest(".item"); if (el) preview({ type: "inner", index: +el.dataset.i }); };
    l.addEventListener("mouseover", pick);
    l.addEventListener("focusin", pick);
    l.addEventListener("mouseleave", () => preview(null));
    l.addEventListener("focusout", () => preview(null));
  });
  legend.querySelectorAll("button").forEach(b => {
    const g = () => ({ type: "group", kind: b.dataset.group });
    b.addEventListener("mouseenter", () => preview(g()));
    b.addEventListener("mouseleave", () => preview(null));
    b.addEventListener("click", () => pin(same(pinned, g()) ? null : g()));
  });

  function hit(x, y) {
    for (const n of innerNodes) {
      if (Math.hypot(x - n.px, y - n.py) < 14) return { type: "inner", index: n.index };
      if (n.labelW && Math.abs(x - n.px) < n.labelW / 2 + 4 && y > n.labelTop && y < n.labelTop + n.labelH + 4) return { type: "inner", index: n.index };
    }
    for (const h of hubs) {
      const [lx, ly] = hubLabelPos(h);
      if (Math.hypot(x - h.px, y - h.py) < 16 || (Math.abs(x - lx) < 45 && Math.abs(y - ly) < 14)) return { type: "field", id: h.field };
    }
    return null;
  }
  const hitAt = e => { const r = canvas.getBoundingClientRect(); return hit(e.clientX - r.left, e.clientY - r.top); };
  canvas.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const h = hitAt(e);
    if (!same(h, active)) preview(h);
  });
  canvas.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") preview(null); });
  canvas.addEventListener("click", e => {
    const h = hitAt(e);
    pin(same(h, pinned) ? null : h);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && pinned) pin(null); });

  // Arriving from another page at /#area-id: pin that area.
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const i = INNER.findIndex(it => it.id === id);
    if (i >= 0) pin({ type: "inner", index: i });
  }
  window.addEventListener("hashchange", fromHash);

  new ResizeObserver(resize).observe(canvas);
  reduce.addEventListener?.("change", start);
  const redraw = () => { if (!animating) draw(performance.now()); };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.fonts?.ready.then(() => { relaxLabels(); redraw(); });
  resize();
  fromHash();
  start();
})();
