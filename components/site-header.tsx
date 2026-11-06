"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { profile } from "@/lib/site";
import { SkinPicker, openThemes } from "@/components/skin";
import { ArrowUpRight, CloseIcon, SearchIcon } from "@/components/icons";
import { navChapters } from "@/components/chapters";

const links = navChapters.map((c) => ({ href: c.href, label: c.nav, n: c.n, name: c.name }));

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="hdr-brand" aria-label="Tushar Gautam, home" onClick={onClick}>
      <span>tushar</span>
      <span>
        gautam<i>.</i>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y > 220 && y > last + 8) setHidden(true);
      else if (y < last - 8 || y <= 220) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openPalette = () => {
    window.dispatchEvent(new Event("tg-open-palette"));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className={`hdr ${scrolled ? "is-scrolled" : ""} ${hidden && !open ? "is-hidden" : ""}`}>
        <Wordmark />

        <nav className="hdr-nav" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
              title={`Chapter ${link.n} · ${link.name}`}
            >
              <sup>{link.n}</sup>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hdr-actions">
          <button type="button" className="hdr-btn" onClick={openPalette} aria-label="Open command palette">
            <SearchIcon width={15} height={15} />
            <kbd>⌘K</kbd>
          </button>
          <div className="hdr-themes">
            <button type="button" className="hdr-themes-label" onClick={openThemes} tabIndex={-1} aria-hidden="true">
              Themes
            </button>
            <SkinPicker />
          </div>
          <a className="hdr-cta no-print" href={`mailto:${profile.email}`}>
            Email me
            <ArrowUpRight width={13} height={13} />
          </a>
          <button
            type="button"
            className="hdr-menu"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </header>

      {open ? (
        <div className="menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="menu-top">
            <Wordmark onClick={() => setOpen(false)} />
            <button type="button" className="hdr-menu is-close" onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon width={14} height={14} />
              Close
            </button>
          </div>

          <nav className="menu-links" aria-label="Mobile">
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{ "--i": i } as CSSProperties}
              >
                <sup>{link.n}</sup>
                {link.label}
                <small>{link.name}</small>
              </Link>
            ))}
          </nav>

          <div className="menu-foot">
            <div className="menu-themes">
              <SkinPicker />
              <button type="button" onClick={() => { setOpen(false); openThemes(); }}>
                Change theme
              </button>
            </div>
            <a className="menu-mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
