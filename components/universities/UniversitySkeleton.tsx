export default function UniversitySkeleton() {
  return (
    <div className="glass-card bg-card/60 border border-white/5 p-5 rounded-2xl flex flex-col h-[280px] animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-white/10 shrink-0"></div>
          <div className="space-y-2">
            <div className="h-5 bg-white/10 rounded-md w-32"></div>
            <div className="h-4 bg-white/5 rounded-md w-24"></div>
          </div>
        </div>
      </div>

      <div className="flex-grow mt-2">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-white/5 rounded-md"></div>
          <div className="h-6 w-16 bg-white/5 rounded-md"></div>
          <div className="h-6 w-12 bg-white/5 rounded-md"></div>
        </div>
        <div className="h-4 w-3/4 bg-white/5 rounded-md mt-6"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
        <div className="h-10 bg-white/5 rounded-xl"></div>
        <div className="h-10 bg-white/10 rounded-xl"></div>
      </div>
    </div>
  );
}
