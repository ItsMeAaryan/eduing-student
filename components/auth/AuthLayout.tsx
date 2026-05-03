"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#0a0a0a] selection:bg-[#6366f1]/30">
      {/* Left Panel - Hidden on Mobile, Visible on Desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-[#242424] bg-[#0d0d0d]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/8 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="text-3xl flex items-center">
            <span className="text-white font-[800]">EDU</span>
            <span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span>
          </Link>
          <div className="mt-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lg:text-5xl font-extrabold text-white leading-tight"
            >
              One Profile.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Every University.
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-lg text-textSecondary max-w-md"
            >
              The unified admission platform simplifying the journey for students and universities across India.
            </motion.p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#141414] border border-[#242424] rounded-2xl p-4"
          >
            <h3 className="text-2xl font-bold text-white mb-1">500+</h3>
            <p className="text-sm text-textSecondary">Universities Onboarded</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#141414] border border-[#242424] rounded-2xl p-4"
          >
            <h3 className="text-2xl font-bold text-white mb-1">50k+</h3>
            <p className="text-sm text-textSecondary">Students Registered</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="text-3xl flex items-center justify-center">
              <span className="text-white font-[800]">EDU</span>
              <span className="font-[800] bg-clip-text text-transparent bg-gradient-to-br from-[#6c6fff] to-[#4f8eff]">ING</span>
            </Link>
          </div>
          
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            {subtitle && <p className="text-textSecondary mb-8">{subtitle}</p>}
            
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
