// What I've Been Up To: the field filter. Each field button shows one dot per entry that draws on it;
// choosing a field dims the entries that don't. The section stays hidden without JavaScript.
(() => {
  const section = document.getElementById("field-filter");
  const list = document.getElementById("fields");
  if (!section || !list) return;
  const entries = [...document.querySelectorAll(".entry[data-fields]")];
  const timelines = [...document.querySelectorAll(".timeline")];
  const status = document.getElementById("status");
  const clear = document.getElementById("clear");
  const fieldsOf = el => el.dataset.fields.split(" ");
  const buttons = [...list.querySelectorAll("button")];
  const nameOf = id => list.querySelector(`[data-field="${id}"] .fname`).textContent;

  buttons.forEach(b => {
    const n = entries.filter(e => fieldsOf(e).includes(b.dataset.field)).length;
    b.querySelector(".count").innerHTML = "<i></i>".repeat(n) + `<b>${n}</b>`;
    b.setAttribute("aria-label", `${nameOf(b.dataset.field)}, ${n} ${n === 1 ? "entry" : "entries"}`);
  });
  const idle = `${entries.length} entries across ${buttons.length} fields`;
  status.textContent = idle;
  section.hidden = false;

  let current = null;
  function setField(id) {
    current = id;
    buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.field === id)));
    timelines.forEach(t => t.classList.toggle("dim", !!id));
    let hits = 0;
    entries.forEach(el => {
      const m = !!id && fieldsOf(el).includes(id);
      if (m) hits++;
      el.classList.toggle("match", m);
      el.querySelectorAll(".chip").forEach(c => c.classList.toggle("hit", m && c.dataset.field === id));
      el.querySelectorAll(".glyph .dot").forEach(d => d.classList.toggle("hit", m && d.dataset.field === id));
    });
    clear.hidden = !id;
    status.textContent = id ? `${hits} of ${entries.length} entries draw on ${nameOf(id).toLowerCase()}` : idle;
  }
  list.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) setField(current === b.dataset.field ? null : b.dataset.field);
  });
  clear.addEventListener("click", () => { setField(null); buttons[0].focus(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && current) setField(null); });
})();
