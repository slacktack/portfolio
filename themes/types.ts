export type View = "home" | "systems" | "system" | "projects" | "lab" | "notes" | "note" | "about" | "missing";

export type Route = { view: View; slug?: string; path: string };

export type ThemeAppProps = { route: Route };

export function parseRoute(path: string): Route {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  const [a, b] = parts;
  if (!a) return { view: "home", path };
  if (a === "systems") return b ? { view: "system", slug: b, path } : { view: "systems", path };
  if (a === "notes") return b ? { view: "note", slug: b, path } : { view: "notes", path };
  if (a === "projects" && !b) return { view: "projects", path };
  if (a === "lab" && !b) return { view: "lab", path };
  if (a === "about" && !b) return { view: "about", path };
  return { view: "missing", path };
}
