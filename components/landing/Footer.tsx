"use client";

import Link from "next/link";

const columns = [
  {
    title: "Products",
    links: [
      { label: "Universities", href: "#universities" },
      { label: "Programs", href: "#" },
      { label: "AI Match", href: "#" },
      { label: "Teams", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="px-5 bg-[#080808] border-t border-[var(--border)]">
      <div className="max-w-[1200px] mx-auto py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <span className="text-[18px] font-[800] tracking-tight flex items-center gap-2">
              <span className="text-white">◆</span>
              <div className="flex items-center">
                <span className="text-white font-[800]">EDU</span>
                <span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span>
              </div>
            </span>
            <p className="text-[14px] mt-3 leading-[1.65] text-[var(--text-muted)] max-w-[200px]">
              The future of university applications on the web. One Profile. Every University.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="label text-[var(--text-muted)] mb-4">{col.title}</h4>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[14px] text-[var(--text-dim)] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-[var(--border)]">
          <p className="text-[13px] text-[var(--text-dim)]">
            &copy; 2026 <span className="inline-flex items-center"><span className="text-white font-[800]">EDU</span><span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span></span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
