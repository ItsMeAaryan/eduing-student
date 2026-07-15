"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, GraduationCap, ArrowRight, FileText } from 'lucide-react';
import Logo from '@/components/Logo';

import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

interface AuthContainerProps {
  children: React.ReactNode;
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
    <div className="flex min-h-screen w-full overflow-hidden bg-[#050508] text-white font-sans selection:bg-brand-indigo/30 selection:text-brand-indigoLight">
      
      {/* 
        ==================================================
        LEFT PANEL - 58% (Premium Admissions Illustration)
        ==================================================
      */}
      <div className="hidden lg:flex flex-col w-[58%] relative overflow-hidden bg-[#0A0A0E] border-r border-white/[0.04]">
        
        {/* Ambient Lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-indigo/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/10 blur-[120px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        
        {/* Top Content */}
        <div className="absolute top-12 left-12 z-40">
          <Logo height={32} />
        </div>

        {/* Center Illustration Area */}
        <div className="flex-1 w-full h-full flex items-center justify-center relative p-12">
          
          <div className="relative w-full max-w-[640px] h-[600px]">
            
            {/* Core Graphic 1: Admissions Timeline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[80px] left-[20px] w-[380px] bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-display font-[700] text-white/90 text-[18px]">Application Progress</h3>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  On Track
                </span>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-white/5">
                {[
                  { title: "Profile Completion", date: "Verified", active: true },
                  { title: "Academic Records", date: "Verified", active: true },
                  { title: "University Selection", date: "In Progress", active: false }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 relative z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${item.active ? 'bg-[#0A0A0E] border-brand-indigo' : 'bg-[#0A0A0E] border-white/10'}`}>
                      {item.active && <div className="w-2 h-2 rounded-full bg-brand-indigoLight" />}
                    </div>
                    <div>
                      <h4 className={`font-display text-[14px] font-bold ${item.active ? 'text-white' : 'text-white/40'}`}>{item.title}</h4>
                      <p className="font-sans text-[12px] text-white/30 mt-0.5 font-medium">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Core Graphic 2: Offer Letter Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[280px] right-[20px] w-[340px] bg-gradient-to-br from-[#111116] to-[#0A0A0E] border border-white/[0.08] rounded-[24px] p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-30"
            >
              <div className="w-12 h-12 rounded-[16px] bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                <FileText className="text-white/70" size={20} />
              </div>
              <h4 className="font-display font-[700] text-[16px] text-white/90 mb-1">Offer Letter Received</h4>
              <p className="font-sans text-[13px] text-white/50 mb-6 leading-relaxed">
                Congratulations! You have received a conditional offer from VIT Chennai.
              </p>
              <div className="flex gap-3">
                <div className="flex-1 h-10 rounded-[12px] bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-[12px] font-bold text-brand-indigoLight">
                  Review Offer
                </div>
              </div>
            </motion.div>

            {/* Core Graphic 3: Secure Identity */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-[60px] left-[100px] bg-white/[0.03] border border-white/[0.06] rounded-[20px] py-4 px-6 shadow-xl backdrop-blur-md z-40 flex items-center gap-4"
            >
              <ShieldCheck className="text-emerald-400" size={24} />
              <div>
                <h4 className="font-display font-[700] text-[13px] text-white/90">Identity Verified</h4>
                <p className="font-sans text-[11px] text-white/40">End-to-end encryption</p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom Left Copy */}
        <div className="absolute bottom-12 left-12 z-40">
          <p className="font-display text-[24px] font-[800] tracking-tight leading-[1.1] text-white/90">
            One Profile.<br />
            <span className="text-white/40">Every University.</span>
          </p>
        </div>
      </div>

      {/* 
        ==================================================
        RIGHT PANEL - 42% (Authentication Container)
        ==================================================
      */}
      <div className="w-full lg:w-[42%] flex flex-col justify-center relative z-10 bg-[#050508]">
        
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 z-20">
          <Logo height={28} />
        </div>

        <div className="w-full max-w-[460px] px-8 sm:px-12 py-8 mx-auto flex flex-col justify-center relative">
          
          {/* Segmented Control */}
          {(isLogin || isRegister) && (
            <div className="mb-8 w-full max-w-[220px] bg-white/[0.02] p-1 rounded-full flex relative border border-white/[0.05] shadow-inner">
              <Link 
                href="/auth/login" 
                className={`flex-1 text-center py-2 rounded-full text-[12px] font-display font-medium transition-colors z-10 ${isLogin ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Sign In
              </Link>
              <Link 
                href="/auth/student/register" 
                className={`flex-1 text-center py-2 rounded-full text-[12px] font-display font-medium transition-colors z-10 ${isRegister ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Register
              </Link>
              
              {/* Animated Pill */}
              <motion.div 
                layoutId="auth-tab-pill-minimal"
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#111116] rounded-full z-0 shadow-md border border-white/[0.08]"
                initial={false}
                animate={{ left: isLogin ? '4px' : 'calc(50% + 0px)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 1 }}
              />
            </div>
          )}

          {/* Form Area */}
          <div className="relative w-full min-h-[580px]">
            <AnimatePresence mode="popLayout">
              {isLogin || isRegister ? (
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="w-full"
                >
                  {isLogin ? <LoginForm /> : <RegisterForm />}
                </motion.div>
              ) : (
                <motion.div
                  key={pathname}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
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
