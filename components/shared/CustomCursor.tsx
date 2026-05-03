"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleHover = () => setHovering(true);
    const handleUnhover = () => setHovering(false);

    const attachListeners = () => {
      document.querySelectorAll("a, button, [role='button'], .glass-card").forEach((el) => {
        el.addEventListener("mouseenter", handleHover);
        el.addEventListener("mouseleave", handleUnhover);
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    attachListeners();

    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    // Smooth follow loop for the ring
    let rafId: number;
    const updateRing = () => {
      const ease = 0.12;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }
      rafId = requestAnimationFrame(updateRing);
    };
    updateRing();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Large Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full border-[1.5px] border-white/50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-[width,height,opacity] duration-300 ease-[var(--ease)] hidden md:block"
        style={{ 
          width: hovering ? 60 : 40, 
          height: hovering ? 60 : 40,
          opacity: hovering ? 0.7 : 1
        }}
      />
      {/* Small Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[10000] w-[6px] h-[6px] bg-white rounded-full -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
    </>
  );
}
