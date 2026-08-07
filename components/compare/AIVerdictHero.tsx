import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, ShieldCheck, Rocket, Briefcase, GraduationCap } from 'lucide-react';
import { AILoadingState } from '@/components/ai/AILoadingState';
import { AIEmptyState } from '@/components/ai/AIEmptyState';

export function AIVerdictHero({ aiAnalysis, loading, error }: any) {
  if (loading) {
    return (
      <div className="py-12 border-b border-border bg-gradient-to-b from-background to-hover/30">
        <AILoadingState title="Analyzing Comparison..." description="Evaluating recommendation scores, financial impact, and career outcomes." />
      </div>
    );
  }

  if (error || !aiAnalysis) {
    return null;
  }

  // Define metric blocks dynamically mapping to the new prompt schema
  const metrics = [
    { key: 'overallWinner', label: 'Best Overall Match', icon: <Trophy size={16} className="text-amber-500" /> },
    { key: 'bestROI', label: 'Best ROI', icon: <Briefcase size={16} className="text-success" /> },
    { key: 'safestAdmission', label: 'Safest Admission', icon: <ShieldCheck size={16} className="text-accent" /> },
    { key: 'stretchChoice', label: 'Ambitious Reach', icon: <Rocket size={16} className="text-warning" /> },
    { key: 'bestAcademics', label: 'Best Academics', icon: <GraduationCap size={16} className="text-primary" /> },
  ].filter(m => aiAnalysis[m.key]?.winner);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12 px-6 md:px-12 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={16} className="text-primary" />
          </div>
          <h2 className="text-[20px] font-bold text-foreground">AI Copilot Verdict</h2>
        </div>

        <p className="text-[15px] leading-relaxed text-foreground/90 font-medium mb-10 max-w-[800px]">
          {aiAnalysis.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {metrics.map(metric => {
            const data = aiAnalysis[metric.key];
            return (
              <div key={metric.key} className="bg-background rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  {metric.icon}
                  <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{metric.label}</span>
                </div>
                <h3 className="text-[16px] font-bold text-foreground mb-2">{data.winner}</h3>
                <p className="text-[13px] text-muted-foreground leading-snug">{data.reason}</p>
              </div>
            );
          })}
        </div>

        {aiAnalysis.finalVerdict && (
          <div className="bg-foreground text-background rounded-2xl p-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-background/60 mb-2 block">Final Recommendation</span>
            <p className="text-[15px] font-semibold leading-relaxed">{aiAnalysis.finalVerdict}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
