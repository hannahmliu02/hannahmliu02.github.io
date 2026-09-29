// Theme toggle: cycles Auto (follow the system) → Light → Dark, and remembers the choice.
(() => {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const root = document.documentElement;
  const ORDER = ["auto", "light", "dark"];
  const LABEL = { auto: "Auto", light: "Light", dark: "Dark" };
  const current = () => root.dataset.theme || "auto";
  function render() {
    const t = current();
    btn.textContent = LABEL[t];
    btn.setAttribute("aria-label", `Colour theme: ${LABEL[t].toLowerCase()}. Click to change.`);
  }
  btn.addEventListener("click", () => {
    const next = ORDER[(ORDER.indexOf(current()) + 1) % ORDER.length];
    if (next === "auto") delete root.dataset.theme; else root.dataset.theme = next;
    try { next === "auto" ? localStorage.removeItem("theme") : localStorage.setItem("theme", next); } catch (e) {}
    render();
  });
  render();
})();
