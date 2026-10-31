"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

interface AuthContainerProps {
  children: React.ReactNode;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function BrandPanel() {
  return (
    <div className="relative hidden h-[calc(100vh-24px)] w-[54%] shrink-0 overflow-hidden rounded-[32px] p-10 text-white lg:sticky lg:top-3 lg:m-3 lg:flex lg:flex-col" style={{ background: '#161326' }}>
      {/* ambient */}
      <motion.div aria-hidden className="absolute -left-[96px] -top-[96px] h-[420px] w-[420px] rounded-full bg-[#4B2FC9] opacity-70 blur-[110px]" animate={{ x: [0, 60, 0], y: [0, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div aria-hidden className="absolute -bottom-[128px] -right-20 h-[380px] w-[380px] rounded-full bg-[#F5B829] opacity-30 blur-[110px]" animate={{ x: [0, -50, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative z-10 flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white"><Image src="/eduing-logo.png" alt="" width={30} height={31} /></span>
        <span className="font-display text-[21px] font-bold tracking-tight">EDU<span className="text-[#B2A2FF]">ING</span><span className="text-[13px] text-[#F5B829]">.in</span></span>
      </div>

      {/* floating cards */}
      <div className="relative z-10 mx-auto my-auto h-[460px] w-full max-w-[560px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}
          className="animate-float-y absolute left-0 top-4 w-[330px] rounded-[26px] bg-white p-6 text-[#17142B] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[16px] font-bold">Application progress</h3>
            <span className="rounded-full bg-[#16A373]/10 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#16A373]">On track</span>
          </div>
          {[['Profile completion', 'Verified', true], ['Academic records', 'Verified', true], ['University selection', 'In progress', false]].map(([t, s, done]) => (
            <div key={t as string} className="mb-3.5 flex items-center gap-3 last:mb-0">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-[#16A373] text-white' : 'border-2 border-dashed border-[#17142B]/20'}`}>{done && <CheckCircle2 size={15} />}</span>
              <div className="text-[13px]"><div className="font-semibold">{t}</div><div className="text-[#17142B]/50">{s}</div></div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="absolute right-0 top-[190px] w-[300px] rounded-[26px] border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl"
          style={{ animation: 'float-y 7s ease-in-out infinite 1s' }}
        >
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5B829] text-[#17142B]"><FileText size={19} /></span>
          <h4 className="text-[16px] font-bold">Offer letter received 🎉</h4>
          <p className="mb-5 mt-1 text-[13px] leading-relaxed text-white/60">Congratulations! You have a conditional offer from VIT Chennai.</p>
          <div className="rounded-full bg-white py-2.5 text-center text-[12.5px] font-bold text-[#17142B]">Review offer</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          className="absolute bottom-0 left-[48px] flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-5 text-[#17142B] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B2FC9] text-white"><ShieldCheck size={17} /></span>
          <div><div className="text-[13px] font-bold">Identity verified</div><div className="text-[11px] text-[#17142B]/50">End-to-end encryption</div></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          className="absolute bottom-[96px] right-6 flex items-center gap-2 rounded-full bg-[#4B2FC9] px-4 py-2 text-[12.5px] font-semibold shadow-[0_14px_34px_-12px_rgba(75,47,201,0.8)]"
        >
          <Sparkles size={14} className="text-[#F5B829]" /> 96% AI match · BITS Pilani
        </motion.div>
      </div>

      <p className="relative z-10 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">
        One profile.<br /><span className="text-[#F5B829]">Every university.</span>
      </p>
    </div>
  );
}

export default function AuthContainer({ children }: AuthContainerProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === '/auth/login';
  const isRegister = pathname?.includes('/register');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen w-full font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <BrandPanel />

      <div className="relative z-10 flex w-full flex-col justify-center lg:w-[46%]">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <div className="absolute left-6 top-6 z-20 lg:hidden">
          <Logo height={28} />
        </div>

        <div className="relative mx-auto flex w-full max-w-[460px] flex-col justify-center px-6 py-[96px] sm:px-10 lg:py-10">
          {(isLogin || isRegister) && (
            <div
              className="relative mb-[32px] flex w-full max-w-[240px] rounded-full p-1"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
            >
              <motion.div
                layoutId="auth-tab-pill"
                className="absolute bottom-1 top-1 z-0 w-[calc(50%-4px)] rounded-full"
                style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}
                initial={false}
                animate={{ left: isLogin ? '4px' : 'calc(50% + 0px)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 1 }}
              />
              <Link href="/auth/login" className="z-10 flex-1 rounded-full py-2 text-center text-[13px] font-semibold transition-colors" style={{ color: isLogin ? '#fff' : 'var(--text-muted)' }}>
                Sign In
              </Link>
              <Link href="/auth/student/register" className="z-10 flex-1 rounded-full py-2 text-center text-[13px] font-semibold transition-colors" style={{ color: isRegister ? '#fff' : 'var(--text-muted)' }}>
                Register
              </Link>
            </div>
          )}

          <div className="relative min-h-[540px] w-full">
            <AnimatePresence mode="popLayout">
              {isLogin || isRegister ? (
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="w-full"
                >
                  {isLogin ? <LoginForm /> : <RegisterForm />}
                </motion.div>
              ) : (
                <motion.div
                  key={pathname}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="w-full"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
