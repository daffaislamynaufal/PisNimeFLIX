import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-[80vh] py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden animate-pulse">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 space-y-12">
        {/* Hero Section Skeleton */}
        <div className="relative w-full h-[350px] md:h-[450px] rounded-xl bg-surface-container/20 border border-white/5 flex items-center p-8 md:p-16">
          <div className="space-y-4 max-w-xl w-full">
            <div className="h-6 w-32 bg-white/10 rounded-full"></div>
            <div className="h-10 w-2/3 bg-white/10 rounded-lg"></div>
            <div className="h-16 w-full bg-white/5 rounded-lg"></div>
            <div className="flex gap-4">
              <div className="h-11 w-32 bg-white/10 rounded-lg"></div>
              <div className="h-11 w-32 bg-white/5 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="relative aspect-[2/3] rounded-xl bg-white/5 border border-white/5"></div>
                <div className="h-4 w-5/6 bg-white/10 rounded-md"></div>
                <div className="h-3.5 w-1/2 bg-white/5 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
