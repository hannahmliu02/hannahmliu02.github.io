// Work packages graph: a centre node, packages on a ring around it, each branching outward into its
// possible projects, and curved links between packages grouped by shared thread.
// Usage: renderWorkPackages(rootElement, data). The root must contain .wp-canvas, .wp-caption,
// .wp-threads and .wp-detail. Data: { center: {name}, threads: [{id, name}],
// packages: [{id, name, focus, projects: [], notes_html?}], links: [{a, b, thread, label}] }.
window.renderWorkPackages = function renderWorkPackages(root, data) {
  const canvas = root.querySelector(".wp-canvas");
  const capEl = root.querySelector(".wp-caption");
  const threadsEl = root.querySelector(".wp-threads");
  const detailEl = root.querySelector(".wp-detail");
  if (!canvas || !data || !(data.packages || []).length) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DEFAULT_CAP = "Hover a package or a link to see how they connect. Select a package for details.";

  let seed = 5;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ----- Graph in unit coordinates (package ring radius 0.5) -----
  const PK = data.packages, THREADS = data.threads || [];
  const threadName = id => (THREADS.find(t => t.id === id) || {}).name || id;
  const center = { kind: "center", name: (data.center || {}).name || "PhD", x: 0, y: 0 };
  const pkgs = PK.map((p, i) => {
    const a = -Math.PI / 2 + i * (Math.PI * 2 / PK.length);
    return { kind: "pkg", id: p.id, name: p.name, p, ang: a, x: Math.cos(a) * 0.5, y: Math.sin(a) * 0.5 };
  });
  const byId = Object.fromEntries(pkgs.map(n => [n.id, n]));
  const projects = [];
  pkgs.forEach(pk => {
    const list = pk.p.projects || [];
    list.forEach((name, j) => {
      const off = list.length === 1 ? -0.45 : (j - (list.length - 1) / 2) * 0.85;
      const a = pk.ang + off, len = 0.36;
      projects.push({ kind: "proj", name, pkg: pk.id, ang: a, x: pk.x + Math.cos(a) * len, y: pk.y + Math.sin(a) * len });
    });
  });
  // Small decorative twigs at the tips, reaching outward (two levels, fractal).
  const twigs = [];
  projects.forEach(pr => {
    const grow = (x, y, ang, len, depth) => {
      if (depth > 2) return;
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      twigs.push({ pr, x1: x, y1: y, x2, y2, depth });
      grow(x2, y2, ang - 0.42 - rand() * 0.1, len * 0.62, depth + 1);
      grow(x2, y2, ang + 0.42 + rand() * 0.1, len * 0.62, depth + 1);
    };
    grow(0, 0, pr.ang - 0.3, 0.06, 1);
    grow(0, 0, pr.ang + 0.3, 0.06, 1);
  });
  const links = (data.links || []).filter(l => byId[l.a] && byId[l.b]).map(l => ({ ...l, A: byId[l.a], B: byId[l.b] }));
  const nodes = [center, ...pkgs, ...projects];
  nodes.forEach(n => { n.ph = rand() * Math.PI * 2; n.w = 0.25 + rand() * 0.3; n.amp = n.kind === "proj" ? 1.4 : 0.9; });

  // ----- Sizing and labels -----
  let W = 0, H = 0, R = 0, cx = 0, cy = 0, animating = false, labels = [];
  const FS = () => ({ pkg: Math.max(14, Math.min(19, R / 13)), proj: Math.max(11, Math.min(13.5, R / 19)), center: Math.max(10, Math.min(11.5, R / 22)) });
  const fontFor = kind => {
    const f = FS();
    return kind === "pkg" ? `400 ${f.pkg}px "Newsreader", Georgia, serif`
      : kind === "proj" ? `italic 400 ${f.proj}px "Newsreader", Georgia, serif`
      : `500 ${f.center}px "IBM Plex Mono", ui-monospace, monospace`;
  };
  const RAD = { center: 6, pkg: 9, proj: 3.5 };
  function wrap(text, maxW) {
    const words = String(text).split(" "), lines = [];
    let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    lines.push(line);
    return lines;
  }
  const base = n => [cx + n.x * R, cy + n.y * R];
  function layoutLabels() {
    const f = FS();
    labels = nodes.map(n => {
      ctx.font = fontFor(n.kind);
      const text = n.kind === "center" ? n.name.toUpperCase() : n.name;
      const lines = n.kind === "proj" ? wrap(text, Math.max(84, R * 0.36)) : n.kind === "pkg" ? wrap(text, Math.max(110, R * 0.5)) : [text];
      const lh = (n.kind === "pkg" ? f.pkg : n.kind === "proj" ? f.proj : f.center) * 1.18;
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)), h = lines.length * lh;
      let ox, oy;
      if (n.kind === "proj") { // outward from the tip, aligned by side
        const dx = Math.cos(n.ang), dy = Math.sin(n.ang);
        ox = dx > 0.35 ? 10 : dx < -0.35 ? -w - 10 : -w / 2;
        oy = dy > 0.35 ? 9 : dy < -0.35 ? -h - 9 : -h / 2;
      } else if (n.kind === "pkg") {
        if (Math.sin(n.ang) < -0.8) { ox = RAD.pkg + 8; oy = -h / 2; } else { ox = -w / 2; oy = RAD.pkg + 6; }
      }
      else { ox = -w / 2; oy = RAD.center + 6; }
      const l = { n, lines, lh, w, h, ox, oy };
      n.label = l;
      return l;
    });
    // Nudge labels off each other and off nodes, and keep them inside the canvas.
    const box = l => { const [x, y] = base(l.n); return { x: x + l.ox, y: y + l.oy, w: l.w, h: l.h }; };
    for (let it = 0; it < 260; it++) {
      let moved = false;
      for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i], b = labels[j], A = box(a), B = box(b);
        const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x) + 4;
        const oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y) + 3;
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        const wa = a.n.kind === "center" ? 0 : 1, wb = b.n.kind === "center" ? 0 : 1, s = wa + wb || 1;
        if (oy < ox) { const d = A.y + A.h / 2 < B.y + B.h / 2 ? -1 : 1; a.oy += d * oy * wa / s; b.oy -= d * oy * wb / s; }
        else { const d = A.x + A.w / 2 < B.x + B.w / 2 ? -1 : 1; a.ox += d * ox * wa / s; b.ox -= d * ox * wb / s; }
      }
      for (const l of labels) {
        for (const n of nodes) {
          if (n === l.n) continue;
          const B = box(l), [nx, ny] = base(n), r = RAD[n.kind] + 3;
          if (nx > B.x - r && nx < B.x + B.w + r && ny > B.y - r && ny < B.y + B.h + r) {
            moved = true;
            if (ny < B.y + B.h / 2) l.oy += ny + r - B.y; else l.oy -= B.y + B.h - (ny - r);
          }
        }
        const B = box(l);
        if (B.x < 4) l.ox += 4 - B.x;
        if (B.x + B.w > W - 4) l.ox -= B.x + B.w - (W - 4);
        if (B.y < 4) l.oy += 4 - B.y;
        if (B.y + B.h > H - 4) l.oy -= B.y + B.h - (H - 4);
      }
      if (!moved) break;
    }
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) / 2 / 1.22;
    cx = W / 2; cy = H / 2;
    layoutLabels();
    if (!animating) draw(performance.now());
  }

  const C = {};
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    ["bg", "fg", "muted", "line", "accent", "accent-2"].forEach(k => (C[k] = s.getPropertyValue("--" + k).trim()));
  }

  // ----- Highlight -----
  // null | {type:'pkg', id} | {type:'link', i} | {type:'thread', id}
  let active = null, pinned = null;
  function pkgOn(id) {
    if (!active) return true;
    if (active.type === "pkg") return id === active.id || links.some(l => (l.a === active.id && l.b === id) || (l.b === active.id && l.a === id));
    if (active.type === "link") return links[active.i].a === id || links[active.i].b === id;
    return links.some(l => l.thread === active.id && (l.a === id || l.b === id));
  }
  function linkOn(i) {
    if (!active) return true;
    const l = links[i];
    if (active.type === "pkg") return l.a === active.id || l.b === active.id;
    if (active.type === "link") return active.i === i;
    return l.thread === active.id;
  }
  const dim = on => (on ? 1 : 0.13);

  // ----- Geometry -----
  function place(now) {
    const t = now / 1000, still = reduce.matches;
    for (const n of nodes) {
      n.px = cx + n.x * R + (still ? 0 : Math.sin(t * n.w + n.ph) * n.amp);
      n.py = cy + n.y * R + (still ? 0 : Math.cos(t * n.w * 0.83 + n.ph * 1.3) * n.amp);
    }
  }
  function curve(l, s) { // quadratic bent toward the centre
    const mx = (l.A.px + l.B.px) / 2, my = (l.A.py + l.B.py) / 2;
    const qx = cx + (mx - cx) * 0.45, qy = cy + (my - cy) * 0.45, u = 1 - s;
    return [u * u * l.A.px + 2 * u * s * qx + s * s * l.B.px, u * u * l.A.py + 2 * u * s * qy + s * s * l.B.py];
  }

  // ----- Pulses -----
  const pulses = [];
  let lastSpawn = 0;
  function spawn(now) {
    if (pulses.length >= 4) return;
    if (links.length && rand() < 0.6) pulses.push({ link: Math.floor(rand() * links.length), rev: rand() < .5, start: now, dur: 2600 + rand() * 800 });
    else { const pk = pkgs[Math.floor(rand() * pkgs.length)]; pulses.push({ spoke: pk, start: now, dur: 1800 + rand() * 600 }); }
  }

  // ----- Draw -----
  const t0 = performance.now();
  const ease = x => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
  function alpha(color, a) { ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.fillStyle = color; }
  function halo(text, x, y, color, a) {
    ctx.globalAlpha = a; ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = C.bg;
    ctx.strokeText(text, x, y); ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  function draw(now) {
    readColors(); place(now);
    const g = reduce.matches ? 1 : ease((now - t0) / 1800), grown = g * 3;
    ctx.clearRect(0, 0, W, H);

    // Spokes: centre → packages → projects
    for (const pk of pkgs) {
      const on = pkgOn(pk.id), k = Math.min(Math.max(grown, 0), 1);
      ctx.lineWidth = 1; ctx.setLineDash([2, 4]); alpha(C.accent, 0.4 * dim(on));
      ctx.beginPath(); ctx.moveTo(center.px, center.py); ctx.lineTo(center.px + (pk.px - center.px) * k, center.py + (pk.py - center.py) * k); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const pr of projects) {
      const pk = byId[pr.pkg], on = pkgOn(pr.pkg), k = Math.min(Math.max(grown - 1, 0), 1);
      if (k <= 0) continue;
      ctx.lineWidth = 1; alpha(C.line, 0.9 * dim(on));
      ctx.beginPath(); ctx.moveTo(pk.px, pk.py); ctx.lineTo(pk.px + (pr.px - pk.px) * k, pk.py + (pr.py - pk.py) * k); ctx.stroke();
    }
    for (const tw of twigs) {
      const k = Math.min(Math.max(grown - 1.6 - tw.depth * 0.25, 0), 1);
      if (k <= 0) continue;
      const s = R, x1 = tw.pr.px + tw.x1 * s, y1 = tw.pr.py + tw.y1 * s, x2 = tw.pr.px + tw.x2 * s, y2 = tw.pr.py + tw.y2 * s;
      ctx.lineWidth = tw.depth === 1 ? 0.8 : 0.6; alpha(C.line, (tw.depth === 1 ? 0.5 : 0.35) * dim(pkgOn(tw.pr.pkg)));
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k); ctx.stroke();
    }

    // Links between packages
    const lk = ease((g - 0.5) / 0.5);
    links.forEach((l, i) => {
      if (lk <= 0) return;
      const on = linkOn(i), lit = on && active;
      ctx.lineWidth = lit ? 2 : 1.2;
      alpha(C["accent-2"], (lit ? 0.95 : 0.5) * lk * dim(on));
      ctx.beginPath();
      for (let s = 0; s <= 30 * lk; s++) { const [x, y] = curve(l, s / 30); s ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    });

    // Pulses
    if (!reduce.matches && g >= 1) {
      if (now - lastSpawn > 1200) { spawn(now); lastSpawn = now; }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], s = (now - p.start) / p.dur;
        if (s >= 1) { pulses.splice(i, 1); continue; }
        const fade = Math.sin(Math.PI * s);
        for (let j = 0; j < 4; j++) {
          const ss = Math.max(s - j * 0.025, 0);
          let x, y, color, on;
          if (p.spoke) { x = center.px + (p.spoke.px - center.px) * ss; y = center.py + (p.spoke.py - center.py) * ss; color = C.accent; on = pkgOn(p.spoke.id); }
          else { [x, y] = curve(links[p.link], p.rev ? 1 - ss : ss); color = C["accent-2"]; on = linkOn(p.link); }
          alpha(color, fade * (0.8 - j * 0.18) * dim(on));
          ctx.beginPath(); ctx.arc(x, y, 2.3 - j * 0.45, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // Nodes
    const nk = ease(grown - 0.2);
    for (const pr of projects) {
      if (grown < 2) continue;
      alpha(pkgOn(pr.pkg) && active ? C.accent : C.line, dim(pkgOn(pr.pkg)));
      ctx.beginPath(); ctx.arc(pr.px, pr.py, RAD.proj, 0, Math.PI * 2); ctx.fill();
    }
    for (const pk of pkgs) {
      const on = pkgOn(pk.id), sel = pinned && pinned.type === "pkg" && pinned.id === pk.id;
      ctx.globalAlpha = nk * dim(on);
      ctx.fillStyle = C.bg; ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(pk.px, pk.py, RAD.pkg + (sel ? 2 : 0), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(pk.px, pk.py, sel || (active && on) ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = nk * (active ? 0.6 : 1);
    ctx.fillStyle = C.accent;
    const s = RAD.center;
    ctx.beginPath(); ctx.moveTo(center.px, center.py - s); ctx.lineTo(center.px + s, center.py); ctx.lineTo(center.px, center.py + s); ctx.lineTo(center.px - s, center.py); ctx.closePath(); ctx.fill();

    // Labels
    const la = ease(grown - 1.2);
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    for (const l of labels) {
      const n = l.n;
      const on = n.kind === "center" ? true : n.kind === "pkg" ? pkgOn(n.id) : pkgOn(n.pkg);
      ctx.font = fontFor(n.kind);
      const color = n.kind === "pkg" ? C.fg : n.kind === "proj" ? C.muted : C.accent;
      l.lines.forEach((ln, i) => {
        const lw = ctx.measureText(ln).width;
        const x = n.px + l.ox + (l.w - lw) / 2; // centre each line in the label box
        halo(ln, x, n.py + l.oy + i * l.lh, color, la * dim(on));
      });
    }
    ctx.globalAlpha = 1;
  }
  function frame(now) { draw(now); if (!reduce.matches) requestAnimationFrame(frame); else animating = false; }
  function start() { if (!reduce.matches && !animating) { animating = true; requestAnimationFrame(frame); } else draw(performance.now()); }

  // ----- Caption, threads, detail -----
  function caption(a) {
    if (!capEl) return;
    if (!a) { capEl.innerHTML = DEFAULT_CAP; return; }
    if (a.type === "link") {
      const l = links[a.i];
      capEl.innerHTML = `<strong>${esc(l.A.name)} · ${esc(l.B.name)}</strong> <span class="wp-tag">${esc(threadName(l.thread))}</span> ${esc(l.label)}`;
    } else if (a.type === "pkg") {
      const pk = byId[a.id];
      capEl.innerHTML = `<strong>${esc(pk.name)}.</strong> ${esc(pk.p.focus || "")}`;
    } else {
      const n = links.filter(l => l.thread === a.id).length;
      capEl.innerHTML = `<strong>${esc(threadName(a.id))}.</strong> ${n} ${n === 1 ? "link" : "links"} between packages.`;
    }
  }
  function detail(id) {
    if (!detailEl) return;
    const pk = byId[id];
    if (!pk) {
      detailEl.innerHTML = `<p class="kicker">${pkgs.length} work packages</p>
        <ul class="wp-overview">${pkgs.map(n => `<li><button type="button" class="wp-jump" data-id="${esc(n.id)}">${esc(n.name)}</button><span>${esc(n.p.focus || "")}</span></li>`).join("")}</ul>
        <p class="wp-empty">Select a package for its possible projects and connections.</p>`;
      detailEl.querySelectorAll(".wp-jump").forEach(b => b.addEventListener("click", () => pin({ type: "pkg", id: b.dataset.id })));
      return;
    }
    const conn = links.filter(l => l.a === id || l.b === id).map(l => ({ other: l.a === id ? l.B : l.A, l }));
    detailEl.innerHTML = `
      <p class="kicker">Work package</p>
      <h3>${esc(pk.name)}</h3>
      ${pk.p.focus ? `<p class="wp-focus">${esc(pk.p.focus)}</p>` : ""}
      ${(pk.p.projects || []).length ? `<h4 class="mono-label">Possible projects</h4><ul class="wp-list">${pk.p.projects.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${pk.p.notes_html ? `<h4 class="mono-label">Notes</h4><div class="wp-notes">${pk.p.notes_html}</div>` : ""}
      ${conn.length ? `<h4 class="mono-label">Connects to</h4><ul class="wp-conn">${conn.map(c => `
        <li><button type="button" class="wp-jump" data-id="${esc(c.other.id)}">${esc(c.other.name)}</button>
        <span class="wp-tag">${esc(threadName(c.l.thread))}</span><span>${esc(c.l.label)}</span></li>`).join("")}</ul>` : ""}`;
    detailEl.querySelectorAll(".wp-jump").forEach(b => b.addEventListener("click", () => pin({ type: "pkg", id: b.dataset.id })));
  }
  if (threadsEl) {
    threadsEl.innerHTML = THREADS.map(t => `<button type="button" data-thread="${esc(t.id)}"><span class="wp-swatch"></span>${esc(t.name)}</button>`).join("");
    threadsEl.querySelectorAll("button").forEach(b => {
      const a = () => ({ type: "thread", id: b.dataset.thread });
      b.addEventListener("mouseenter", () => preview(a()));
      b.addEventListener("mouseleave", () => preview(null));
      b.addEventListener("focus", () => preview(a()));
      b.addEventListener("blur", () => preview(null));
      b.addEventListener("click", () => pin(same(pinned, a()) ? null : a()));
    });
  }
  const same = (a, b) => (!a && !b) || (!!a && !!b && a.type === b.type && a.id === b.id && a.i === b.i);
  function setActive(a) {
    active = a;
    threadsEl?.querySelectorAll("button").forEach(b => b.classList.toggle("on", !!a && a.type === "thread" && a.id === b.dataset.thread));
    canvas.style.cursor = a ? "pointer" : "default";
    if (!animating) draw(performance.now());
  }
  function preview(a) { setActive(a || pinned); caption(a || pinned); }
  function pin(a) {
    pinned = a; setActive(a); caption(a);
    if (!a || a.type === "pkg") detail(a ? a.id : null);
  }

  function hit(x, y) {
    for (const pk of pkgs) if (Math.hypot(x - pk.px, y - pk.py) < 16) return { type: "pkg", id: pk.id };
    for (const l of labels) if (l.n.kind === "pkg") {
      const bx = l.n.px + l.ox, by = l.n.py + l.oy;
      if (x > bx - 4 && x < bx + l.w + 4 && y > by - 3 && y < by + l.h + 3) return { type: "pkg", id: l.n.id };
    }
    for (const pr of projects) if (Math.hypot(x - pr.px, y - pr.py) < 10) return { type: "pkg", id: pr.pkg };
    let best = null, bestD = 7;
    links.forEach((l, i) => { for (let s = 0; s <= 40; s++) { const [px, py] = curve(l, s / 40); const d = Math.hypot(x - px, y - py); if (d < bestD) { bestD = d; best = { type: "link", i }; } } });
    return best;
  }
  const at = e => { const r = canvas.getBoundingClientRect(); return hit(e.clientX - r.left, e.clientY - r.top); };
  canvas.addEventListener("pointermove", e => { if (e.pointerType === "mouse") { const h = at(e); if (!same(h, active)) preview(h); } });
  canvas.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") preview(null); });
  canvas.addEventListener("click", e => { const h = at(e); pin(same(h, pinned) ? null : h); });

  new ResizeObserver(resize).observe(canvas);
  reduce.addEventListener?.("change", start);
  const redraw = () => { if (!animating) draw(performance.now()); };
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", redraw);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.fonts?.ready.then(() => { layoutLabels(); redraw(); });
  caption(null);
  detail(null);
  resize();
  start();
};
