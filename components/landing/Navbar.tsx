"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Universities", href: "#universities" },
    { label: "About", href: "#about" },
    { label: "For Universities", href: "#for-universities" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-250 ${
        scrolled
          ? "bg-[rgba(8,8,8,0.9)] backdrop-blur-[24px] border-b border-[var(--border)]"
          : "bg-transparent backdrop-blur-[24px]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-[20px] tracking-tight z-50 flex items-center gap-2"
          >
            <span className="text-white">◆</span>
            <div className="flex items-center">
              <span className="text-white font-[800]">EDU</span>
              <span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium text-[var(--text-muted)] hover:text-white transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Desktop Log In */}
            <a
              href="https://app.eduing.in/auth/student/login"
              className="text-[14px] font-medium text-white px-5 py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-[250ms] ease-[var(--ease)]"
            >
              Log In
            </a>
            {/* Desktop Get Started */}
            <a
              href="https://app.eduing.in/auth/student/register"
              className="text-[14px] font-[600] text-black bg-white px-5 py-2.5 rounded-[10px] hover:scale-[1.04] transition-all duration-[250ms] ease-[var(--ease)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 z-50"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#080808] z-40 flex flex-col items-center justify-center p-10 md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[24px] font-bold text-[var(--text-muted)] hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                {/* Mobile Log In */}
                <a
                  href="https://app.eduing.in/auth/student/login"
                  onClick={() => setIsOpen(false)}
                  className="text-[18px] font-medium text-white border border-white/20 px-8 py-4 rounded-xl"
                >
                  Log In
                </a>
                {/* Mobile Get Started */}
                <a
                  href="https://app.eduing.in/auth/student/register"
                  onClick={() => setIsOpen(false)}
                  className="text-[18px] font-bold text-black bg-white px-8 py-4 rounded-xl"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Universities", href: "#universities" },
    { label: "About", href: "#about" },
    { label: "For Universities", href: "#for-universities" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-250 ${
        scrolled
          ? "bg-[rgba(8,8,8,0.9)] backdrop-blur-[24px] border-b border-[var(--border)]"
          : "bg-transparent backdrop-blur-[24px]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-10">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-[20px] tracking-tight z-50 flex items-center gap-2"
          >
            <span className="text-white">◆</span>
            <div className="flex items-center">
              <span className="text-white font-[800]">EDU</span>
              <span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] font-medium text-[var(--text-muted)] hover:text-white transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/auth/student/login"
              className="text-[14px] font-medium text-white px-5 py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-[250ms] ease-[var(--ease)]"
            >
              Log In
            </Link>
            <Link
              href="/auth/student/register"
              className="text-[14px] font-[600] text-black bg-white px-5 py-2.5 rounded-[10px] hover:scale-[1.04] transition-all duration-[250ms] ease-[var(--ease)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 z-50"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#080808] z-40 flex flex-col items-center justify-center p-10 md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[24px] font-bold text-[var(--text-muted)] hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  href="/auth/student/login"
                  onClick={() => setIsOpen(false)}
                  className="text-[18px] font-medium text-white border border-white/20 px-8 py-4 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/student/register"
                  onClick={() => setIsOpen(false)}
                  className="text-[18px] font-bold text-black bg-white px-8 py-4 rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
