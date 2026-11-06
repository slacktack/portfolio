export type ChapterId = "request" | "systems" | "bench" | "garage" | "notes" | "person" | "hello";

export type Chapter = {
  id: ChapterId;
  n: string;
  href: string;
  nav: string;
  name: string;
  line: string;
};

export const chapters: Chapter[] = [
  { id: "request", n: "00", href: "/", nav: "Home", name: "The request", line: "One search, and everything it sets off." },
  { id: "systems", n: "01", href: "/systems", nav: "Systems", name: "The systems", line: "Where the request goes, and what still hurts." },
  { id: "bench", n: "02", href: "/lab", nav: "Lab", name: "The bench", line: "The same mechanisms, taken apart to break on purpose." },
  { id: "garage", n: "03", href: "/projects", nav: "Projects", name: "The garage", line: "After hours. Live URLs, still running." },
  { id: "notes", n: "04", href: "/notes", nav: "Notes", name: "The notes", line: "What the work taught, written down." },
  { id: "person", n: "05", href: "/about", nav: "About", name: "The person", line: "Who is behind the terminal." },
  { id: "hello", n: "06", href: "#hello", nav: "Hello", name: "Hello", line: "Bring a hard problem." },
];

export const navChapters = chapters.filter((c) => c.id !== "request" && c.id !== "hello");

export function chapter(id: ChapterId) {
  return chapters.find((c) => c.id === id) ?? chapters[0];
}

export function nextChapter(id: ChapterId) {
  const i = chapters.findIndex((c) => c.id === id);
  return chapters[Math.min(i + 1, chapters.length - 1)];
}

export function chapterForPath(path: string): ChapterId | null {
  if (path === "/") return "request";
  const hit = navChapters.find((c) => path === c.href || path.startsWith(`${c.href}/`));
  return hit ? hit.id : null;
}
