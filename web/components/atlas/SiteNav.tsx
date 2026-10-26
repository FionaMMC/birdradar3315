"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./site.css";

export default function SiteNav({ active }: { active?: "home" | "explore" | "collection" | "lights-out" | "birds" }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return <header className="site-nav">
    <Link className="site-brand" href="/" aria-label="BirdRadar home">BirdRadar</Link>
    <button ref={menuButton} type="button" className="site-menu-button" aria-expanded={open} aria-controls="site-links" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"}>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{open ? <path d="m5 5 14 14M19 5 5 19"/> : <path d="M3 8h18M3 16h18"/>}</svg>
    </button>
    <nav id="site-links" aria-label="Main navigation" onClick={() => setOpen(false)} className={`site-links${open ? " site-links--open" : ""}`}>
      <Link href="/track-migration" aria-current={active === "explore" ? "page" : undefined}>Map</Link>
      <Link href="/species-library" aria-current={active === "birds" ? "page" : undefined}>Birds</Link>
      <Link href="/collection" aria-current={active === "collection" ? "page" : undefined}>Collection</Link>
      <Link className="site-links__action" href="/lights-out" aria-current={active === "lights-out" || pathname === "/lights-out" ? "page" : undefined}>Lights Out <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M15.5 12.4A7 7 0 0 1 7.6 4.5 6.2 6.2 0 1 0 15.5 12.4Z" /></svg></Link>
    </nav>
  </header>;
}
