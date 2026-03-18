export function applyTheme(theme) {
  const root = document.documentElement;

  // remove old
  root.classList.remove("dark");
  root.classList.remove("light");

  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }

  if (theme === "light") {
    root.classList.add("light");
    return;
  }

  // system
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  root.classList.add(prefersDark ? "dark" : "light");
}
