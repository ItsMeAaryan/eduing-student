'use client'

import React from 'react'

const SkeletonCard = () => {
  return (
    <div className="glass-card overflow-hidden h-[420px] flex flex-col p-6 animate-pulse border-white/5">
      <div className="h-24 -mt-6 -mx-6 bg-white/5 mb-6" />
      <div className="w-20 h-20 rounded-2xl bg-white/5 mb-6" />
      <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-2" />
      <div className="h-4 w-1/2 bg-white/5 rounded-lg mb-6" />
      <div className="flex gap-2 mb-8">
        <div className="h-6 w-20 bg-white/5 rounded-full" />
        <div className="h-6 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="space-y-3 flex-1">
        <div className="h-4 w-full bg-white/5 rounded-lg" />
        <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  )
}

export default SkeletonCard
