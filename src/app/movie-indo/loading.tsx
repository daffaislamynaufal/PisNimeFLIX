import React from 'react';

export default function MovieIndoLoading() {
  // Generate 12 skeleton items
  const skeletonItems = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="min-h-screen py-8 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header Title Section Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-72 bg-white/5 rounded-md animate-pulse"></div>
          </div>
          
          <div className="h-6 w-24 bg-primary/10 border border-primary/20 rounded-full animate-pulse"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="w-full flex flex-col gap-4 mb-8">
          <div className="h-11 max-w-md w-full bg-surface-container-high/40 border border-outline-variant/30 rounded-xl animate-pulse"></div>
        </div>

        {/* Movies Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {skeletonItems.map((item) => (
            <div key={item} className="flex flex-col gap-3">
              {/* Poster Skeleton */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface-container-high/40 border border-white/5 shadow-lg animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Title & Subtitle Skeletons */}
              <div className="space-y-2">
                <div className="h-3 w-5/6 bg-white/10 rounded-md animate-pulse"></div>
                <div className="h-3 w-1/2 bg-white/5 rounded-md animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
