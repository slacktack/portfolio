"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { notes, profile, projects, systems } from "@/lib/site";
import {
  FlaskIcon,
  HomeIcon,
  LayersIcon,
  MailIcon,
  MoonIcon,
  NoteIcon,
  SearchIcon,
  SparkIcon,
  SunIcon,
  UserIcon,
} from "@/components/icons";

type PaletteItem = {
  id: string;
  label: string;
  sub: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
};

function flipTheme() {
  const next = document.documentElement.dataset.theme === "night" ? "day" : "night";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("tg-theme", next);
  } catch {
    // no-op
  }
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("tg-open-palette", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("tg-open-palette", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActive(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const navigate = (href: string) => {
    close();
    router.push(href);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      close();
    } catch {
      close();
    }
  };

  const toggleTheme = () => {
    flipTheme();
    close();
  };

  const items: PaletteItem[] = [
    {
      id: "home",
      label: "Home",
      sub: "Page",
      group: "Pages",
      icon: <HomeIcon width={12} height={12} />,
      action: () => navigate("/"),
    },
    {
      id: "systems",
      label: "Systems",
      sub: "Page",
      group: "Pages",
      icon: <LayersIcon width={12} height={12} />,
      action: () => navigate("/systems"),
    },
    {
      id: "projects",
      label: "Projects",
      sub: "Page",
      group: "Pages",
      icon: <SparkIcon width={12} height={12} />,
      action: () => navigate("/projects"),
    },
    {
      id: "lab",
      label: "The lab",
      sub: "Page",
      group: "Pages",
      icon: <FlaskIcon width={12} height={12} />,
      action: () => navigate("/lab"),
    },
    {
      id: "notes",
      label: "Field notes",
      sub: "Page",
      group: "Pages",
      icon: <NoteIcon width={12} height={12} />,
      action: () => navigate("/notes"),
    },
    {
      id: "about",
      label: "About",
      sub: "Page",
      group: "Pages",
      icon: <UserIcon width={12} height={12} />,
      action: () => navigate("/about"),
    },
    ...systems.map((system) => ({
      id: `system-${system.slug}`,
      label: system.title,
      sub: `System ${system.index}`,
      group: "Systems",
      icon: <LayersIcon width={12} height={12} />,
      action: () => navigate(`/systems/${system.slug}`),
    })),
    ...projects.map((project) => ({
      id: `project-${project.slug}`,
      label: project.title,
      sub: project.category,
      group: "Projects",
      icon: <SparkIcon width={12} height={12} />,
      action: () => navigate(`/projects#${project.slug}`),
    })),
    ...notes.map((note) => ({
      id: `note-${note.slug}`,
      label: note.title,
      sub: note.category,
      group: "Field notes",
      icon: <NoteIcon width={12} height={12} />,
      action: () => navigate(`/notes/${note.slug}`),
    })),
    {
      id: "copy-email",
      label: "Copy email",
      sub: profile.email,
      group: "Actions",
      icon: <MailIcon width={12} height={12} />,
      action: copyEmail,
    },
    {
      id: "toggle-theme",
      label: "Toggle day / night shift",
      sub: "Theme",
      group: "Actions",
      icon:
        typeof document !== "undefined" &&
        document.documentElement.dataset.theme === "night" ? (
          <SunIcon width={12} height={12} />
        ) : (
          <MoonIcon width={12} height={12} />
        ),
      action: toggleTheme,
    },
  ];

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? items.filter((item) =>
        `${item.label} ${item.sub} ${item.group}`.toLowerCase().includes(normalized)
      )
    : items;

  const groups = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const activeIndex = Math.min(active, Math.max(0, filtered.length - 1));

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (filtered.length ? (value + 1) % filtered.length : 0));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) =>
        filtered.length ? (value - 1 + filtered.length) % filtered.length : 0
      );
    }
    if (event.key === "Enter" && filtered[activeIndex]) {
      event.preventDefault();
      filtered[activeIndex].action();
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cmdk-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={close}
        >
          <motion.div
            className="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cmdk-input-row">
              <SearchIcon width={15} height={15} />
              <input
                ref={inputRef}
                className="cmdk-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Where do you want to go?"
                aria-label="Search pages, systems, notes, and actions"
                autoComplete="off"
              />
              <span className="cmdk-esc">ESC</span>
            </div>

            <div className="cmdk-results" ref={listRef} role="listbox" aria-label="Results">
              {filtered.length === 0 ? (
                <div className="cmdk-empty">No matching route. Try “flights” or “calibration.”</div>
              ) : (
                Object.entries(groups).map(([group, groupItems]) => (
                  <div key={group}>
                    <div className="cmdk-group-label">{group}</div>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={activeIndex === index}
                          data-index={index}
                          data-active={activeIndex === index}
                          className="cmdk-item"
                          onMouseEnter={() => setActive(index)}
                          onClick={item.action}
                        >
                          <span className="icon">{item.icon}</span>
                          <span>{item.label}</span>
                          <span className="sub">{item.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="cmdk-foot">
              <span>
                <span className="kbd">↑</span> <span className="kbd">↓</span> navigate
              </span>
              <span>
                <span className="kbd">↵</span> open
              </span>
              <span>
                <span className="kbd">esc</span> close
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
