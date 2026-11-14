import React from 'react';

export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-[#FFFDF7] rounded-2xl border border-[#E8DCC4] p-4 space-y-3 animate-pulse">
      <div className="h-10 bg-neutral-200/60 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-neutral-100 rounded-xl w-full flex items-center justify-between px-4">
          <div className="w-1/3 h-4 bg-neutral-200 rounded" />
          <div className="w-1/6 h-4 bg-neutral-200 rounded" />
          <div className="w-1/6 h-4 bg-neutral-200 rounded" />
        </div>
      ))}
    </div>
  );
};

export const AdminCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#FFFDF7] p-5 rounded-2xl border border-[#E8DCC4] space-y-3">
          <div className="w-10 h-10 bg-neutral-200/70 rounded-xl" />
          <div className="w-1/2 h-4 bg-neutral-200 rounded" />
          <div className="w-3/4 h-6 bg-neutral-300 rounded" />
        </div>
      ))}
    </div>
  );
};
