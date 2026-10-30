import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="relative w-24 h-24">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        {/* Inner pulsing logo */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <Image src="/eduing-logo.png" alt="EDUING" width={48} height={50} className="object-contain" priority />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium tracking-[0.2em] text-textSecondary uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}
