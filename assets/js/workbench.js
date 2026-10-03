// Workbench: decrypts the private notes in the browser and draws how the work connects.
// The encrypted file is made by scripts/encrypt-workbench.py (AES-256-GCM, key from PBKDF2-SHA256).
(() => {
  const script = document.getElementById("wb-script");
  const form = document.getElementById("unlock-form");
  if (!script || !form) return;
  const SRC = script.dataset.src;
  const FIELDS = JSON.parse(document.getElementById("wb-fields").textContent);
  const $ = id => document.getElementById(id);
  const msg = $("wb-msg"), input = $("wb-password"), submit = $("wb-submit"), remember = $("wb-remember");
  const KEY_STORE = "workbench-key";
  const enc = new TextEncoder(), dec = new TextDecoder();
  const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get() { try { return sessionStorage.getItem(KEY_STORE); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem(KEY_STORE, v); } catch (e) {} },
    clear() { try { sessionStorage.removeItem(KEY_STORE); } catch (e) {} },
  };

  let payload = null;
  async function loadPayload() {
    if (payload) return payload;
    const res = await fetch(SRC, { cache: "no-cache" });
    if (!res.ok) throw new Error("missing");
    payload = await res.json();
    return payload;
  }
  async function keyFromPassword(pw, p) {
    const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: fromB64(p.salt), iterations: p.iterations },
      base, { name: "AES-GCM", length: 256 }, true, ["decrypt"]);
  }
  async function decryptWith(key, p) {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(p.iv) }, key, fromB64(p.ciphertext));
    return JSON.parse(dec.decode(plain));
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    submit.disabled = true; msg.textContent = "Unlocking…";
    try {
      const p = await loadPayload();
      const key = await keyFromPassword(input.value, p);
      const data = await decryptWith(key, p);
      if (remember.checked) store.set(p.salt + ":" + toB64(await crypto.subtle.exportKey("raw", key)));
      input.value = ""; msg.textContent = "";
      show(data);
    } catch (err) {
      msg.textContent = err.message === "missing"
        ? "The private notes haven't been published yet."
        : "That password didn't work. Check it and try again.";
      input.select();
    } finally {
      submit.disabled = false;
    }
  });

  // Reopen without the password if this tab already unlocked it (and the file hasn't been re-encrypted).
  (async () => {
    const saved = store.get();
    if (!saved) return;
    try {
      const p = await loadPayload();
      const [salt, raw] = saved.split(":");
      if (salt !== p.salt) { store.clear(); return; }
      const key = await crypto.subtle.importKey("raw", fromB64(raw), "AES-GCM", false, ["decrypt"]);
      show(await decryptWith(key, p));
    } catch (e) { store.clear(); }
  })();

  $("wb-lock").addEventListener("click", () => {
    store.clear();
    location.hash = "";
    location.reload();
  });

  // ----- Rendering -----
  const STATUS = { active: "Active", planned: "Planned", paused: "Paused", done: "Done" };
  let DATA = null, byId = {}, selected = null;

  function glyph(fields) {
    const on = new Set(fields || []);
    const spokes = FIELDS.filter(f => on.has(f.id)).map(f => `<line class="spoke" x1="22" y1="22" x2="${f.gx}" y2="${f.gy}"/>`).join("");
    const dots = FIELDS.map(f => `<circle class="dot${on.has(f.id) ? " on" : ""}" cx="${f.gx}" cy="${f.gy}" r="${on.has(f.id) ? 2.6 : 1.5}"/>`).join("");
    return `<svg class="glyph" viewBox="0 0 44 44" aria-hidden="true"><circle class="ring" cx="22" cy="22" r="16"/>${spokes}${dots}<circle class="core" cx="22" cy="22" r="3"/></svg>`;
  }
  const fieldNames = ids => FIELDS.filter(f => (ids || []).includes(f.id)).map(f => f.name);

  function show(data) {
    DATA = data;
    byId = Object.fromEntries((data.items || []).map(it => [it.id, it]));
    (data.items || []).forEach(it => { it.connections = it.connections || []; it.incoming = []; });
    data.items.forEach(it => it.connections.forEach(c => byId[c.to] && byId[c.to].incoming.push({ from: it.id, label: c.label })));

    $("lock").hidden = true;
    $("workbench").hidden = false;
    if (data.title) { $("wb-title").textContent = data.title; }
    $("wb-intro").textContent = data.intro || "";
    $("wb-updated").textContent = data.updated ? "Updated " + data.updated : "";

    const cols = $("wb-cols");
    cols.style.setProperty("--cols", (data.streams || []).length || 1);
    cols.innerHTML = (data.streams || []).map(s => `
      <div class="wb-col">
        <h3 class="mono-label">${esc(s.name)}</h3>
        <ul>${data.items.filter(it => it.stream === s.id).map(it => `
          <li><button type="button" class="wb-node" data-id="${esc(it.id)}">
            <i class="st ${esc(it.status)}" aria-hidden="true"></i>
            <span class="t">${esc(it.title)}</span>
            <span class="s">${esc(STATUS[it.status] || it.status)}</span>
          </button></li>`).join("")}
        </ul>
      </div>`).join("");

    $("wb-status").innerHTML = Object.keys(STATUS).map(st => {
      const its = data.items.filter(it => it.status === st);
      if (!its.length) return "";
      return `<div class="wb-group"><h3 class="mono-label"><i class="st ${st}"></i>${STATUS[st]} · ${its.length}</h3>
        <ul>${its.map(it => `<li><button type="button" class="wb-link" data-id="${esc(it.id)}">${esc(it.title)}</button>
          <span>${esc(it.summary || "")}</span></li>`).join("")}</ul></div>`;
    }).join("");

    // PhD work packages web
    const pk = data.packages;
    if (pk && (pk.items || []).length && window.renderWorkPackages) {
      $("packages").hidden = false;
      if (pk.title) $("wp-h").textContent = pk.title;
      $("wp-intro").textContent = pk.intro || "";
      window.renderWorkPackages($("packages"), { center: pk.center, threads: pk.threads, packages: pk.items, links: pk.links });
    }

    bind();
    const fromHash = decodeURIComponent(location.hash.slice(1));
    select(byId[fromHash] ? fromHash : (data.items.find(it => it.status === "active") || data.items[0] || {}).id, false);
    drawEdges();
    new ResizeObserver(drawEdges).observe($("wb-board"));
  }

  function related(id) {
    const it = byId[id];
    return new Set([id, ...it.connections.map(c => c.to), ...it.incoming.map(c => c.from)]);
  }

  function highlight(id) {
    const rel = id ? related(id) : null;
    document.querySelectorAll(".wb-node").forEach(n => {
      n.classList.toggle("dim", !!rel && !rel.has(n.dataset.id));
      n.classList.toggle("sel", n.dataset.id === selected);
    });
    document.querySelectorAll(".wb-edges path").forEach(p => {
      const on = !!id && (p.dataset.from === id || p.dataset.to === id);
      p.classList.toggle("on", on);
      p.classList.toggle("dim", !!id && !on);
    });
  }

  function select(id, scroll) {
    if (!id || !byId[id]) return;
    selected = id;
    const it = byId[id];
    const conn = [
      ...it.connections.map(c => ({ id: c.to, label: c.label, dir: "→" })),
      ...it.incoming.map(c => ({ id: c.from, label: c.label, dir: "←" })),
    ];
    $("wb-detail").innerHTML = `
      <div class="wb-d-head">${glyph(it.fields)}
        <div><p class="kicker"><i class="st ${esc(it.status)}"></i>${esc(STATUS[it.status] || it.status)} · ${esc((DATA.streams.find(s => s.id === it.stream) || {}).name || "")}</p>
        <h3>${esc(it.title)}</h3></div></div>
      ${it.summary ? `<p class="wb-d-sum">${esc(it.summary)}</p>` : ""}
      ${fieldNames(it.fields).length ? `<span class="chips">${fieldNames(it.fields).map(n => `<span class="chip">${esc(n)}</span>`).join("")}</span>` : ""}
      ${(it.next || []).length ? `<h4 class="mono-label">Next</h4><ul class="wb-next">${it.next.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      ${it.notes_html ? `<h4 class="mono-label">Notes</h4><div class="wb-notes">${it.notes_html}</div>` : ""}
      ${(it.links || []).length ? `<h4 class="mono-label">Links</h4><ul class="wb-links">${it.links.map(l => `<li><a href="${esc(l.url)}">${esc(l.label)}</a></li>`).join("")}</ul>` : ""}
      ${conn.length ? `<h4 class="mono-label">Connected to</h4><ul class="wb-conn">${conn.map(c => `
        <li><button type="button" class="wb-link" data-id="${esc(c.id)}">${c.dir} ${esc(byId[c.id].title)}</button><span>${esc(c.label || "")}</span></li>`).join("")}</ul>` : ""}`;
    $("wb-detail").querySelectorAll(".wb-link").forEach(b => b.addEventListener("click", () => select(b.dataset.id, true)));
    history.replaceState(null, "", "#" + id);
    highlight(id);
    if (scroll) document.querySelector(`.wb-node[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function bind() {
    document.querySelectorAll(".wb-node").forEach(n => {
      n.addEventListener("click", () => select(n.dataset.id, false));
      n.addEventListener("mouseenter", () => highlight(n.dataset.id));
      n.addEventListener("mouseleave", () => highlight(selected));
      n.addEventListener("focus", () => highlight(n.dataset.id));
      n.addEventListener("blur", () => highlight(selected));
    });
    $("wb-status").querySelectorAll(".wb-link").forEach(b => b.addEventListener("click", () => {
      select(b.dataset.id, true);
      $("wb-board").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }));
  }

  // Curves between nodes. Hidden on narrow screens, where the columns stack.
  function drawEdges() {
    const svg = $("wb-edges"), board = $("wb-board");
    if (!DATA || !svg) return;
    const b = board.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
    svg.setAttribute("width", b.width); svg.setAttribute("height", b.height);
    const rect = id => {
      const el = document.querySelector(`.wb-node[data-id="${CSS.escape(id)}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { l: r.left - b.left, r: r.right - b.left, y: r.top - b.top + r.height / 2 };
    };
    const paths = [];
    DATA.items.forEach(it => it.connections.forEach(c => {
      const A = rect(it.id), B = rect(c.to);
      if (!A || !B) return;
      let d;
      if (Math.abs(A.l - B.l) < 4) { // same column: loop out to the right
        const x = A.r, bulge = 28 + Math.abs(B.y - A.y) * 0.15;
        d = `M${x},${A.y} C${x + bulge},${A.y} ${x + bulge},${B.y} ${x},${B.y}`;
      } else {
        const [x1, x2] = A.l < B.l ? [A.r, B.l] : [A.l, B.r];
        const mid = (x1 + x2) / 2;
        d = `M${x1},${A.y} C${mid},${A.y} ${mid},${B.y} ${x2},${B.y}`;
      }
      paths.push(`<path d="${d}" data-from="${esc(it.id)}" data-to="${esc(c.to)}"><title>${esc(c.label || "")}</title></path>`);
    }));
    svg.innerHTML = paths.join("");
    highlight(selected);
  }
})();
