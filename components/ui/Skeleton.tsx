import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#F3F4F6] rounded-[8px] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-[#EAECF0] rounded-[16px] p-[20px] flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <Skeleton className="w-[120px] h-[16px]" />
        <Skeleton className="w-[40px] h-[20px] rounded-full" />
      </div>
      <Skeleton className="w-[80%] h-[24px]" />
      <Skeleton className="w-[60%] h-[14px]" />
      <div className="flex gap-[8px] mt-[8px]">
        <Skeleton className="w-[60px] h-[24px] rounded-full" />
        <Skeleton className="w-[60px] h-[24px] rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#F3F4F6]">
      <td className="px-[16px] py-[16px]"><Skeleton className="w-[16px] h-[16px]" /></td>
      <td className="px-[16px] py-[16px]"><Skeleton className="w-[140px] h-[16px]" /></td>
      <td className="px-[16px] py-[16px]"><Skeleton className="w-[100px] h-[14px]" /></td>
      <td className="px-[16px] py-[16px]"><Skeleton className="w-[60px] h-[14px]" /></td>
      <td className="px-[16px] py-[16px]"><Skeleton className="w-[80px] h-[14px]" /></td>
      <td className="px-[16px] py-[16px]"><Skeleton className="w-[64px] h-[20px] rounded-full" /></td>
    </tr>
  );
}
