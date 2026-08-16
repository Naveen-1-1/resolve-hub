export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}
