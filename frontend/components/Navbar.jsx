"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DatabaseZap, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["/", "Overview"], ["/upload", "Upload"], ["/dashboard", "Dashboard"],
  ["/logs", "ETL logs"], ["/failed-records", "Data quality"],
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm" style={{ borderColor: "var(--line)" }}>
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4" aria-label="Primary navigation">
        <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setOpen(false)}>
          <span className="grid size-9 place-items-center rounded-[10px] text-white" style={{ background: "var(--primary)" }}><DatabaseZap size={19} /></span>
          <span>RetailFlow</span>
        </Link>
        <button className="rounded-lg p-2 md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <div className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-16 flex-col gap-1 border-b bg-white p-3 md:static md:flex md:flex-row md:border-0 md:p-0`} style={{ borderColor: "var(--line)" }}>
          {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium transition-colors" style={pathname === href ? { background: "var(--primary-soft)", color: "var(--primary-dark)" } : { color: "var(--muted)" }}>{label}</Link>)}
        </div>
      </nav>
    </header>
  );
}
