import React from 'react';

export default function AnimeDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 relative overflow-hidden">
      {/* Cinematic Banner Skeleton */}
      <div className="relative h-[400px] md:h-[500px] w-full bg-surface-container/20 border-b border-white/5 animate-pulse">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-container-max mx-auto px-6 md:px-12 pb-12 w-full grid md:grid-cols-12 gap-8 items-end">
            {/* Poster Skeleton (Desktop) */}
            <div className="hidden md:block md:col-span-3">
              <div className="aspect-[2/3] rounded-xl bg-white/5 border border-white/10 shadow-2xl animate-pulse"></div>
            </div>
            {/* Info Skeleton */}
            <div className="md:col-span-9 space-y-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="h-6 w-12 bg-white/5 rounded-full animate-pulse"></div>
                </div>
                <div className="h-10 w-3/4 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse"></div>
              </div>
              <div className="h-16 w-5/6 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="flex gap-4">
                <div className="h-12 w-40 bg-white/10 rounded-xl animate-pulse"></div>
                <div className="h-12 w-48 bg-white/5 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <section className="max-w-container-max mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="md:col-span-8 space-y-12">
          {/* Synopsis */}
          <div className="space-y-4">
            <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-32 w-full bg-surface-container/20 rounded-2xl border border-white/5 animate-pulse"></div>
          </div>
          {/* Episode List */}
          <div className="space-y-4">
            <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-surface-container/20 border border-white/5 animate-pulse">
                  <div className="w-full sm:w-48 aspect-video rounded-xl bg-white/5 flex-shrink-0"></div>
                  <div className="flex-grow flex flex-col justify-center gap-2">
                    <div className="h-4 w-1/3 bg-white/10 rounded-md"></div>
                    <div className="h-3 w-5/6 bg-white/5 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="md:col-span-4 space-y-8">
          <div className="h-48 w-full bg-surface-container-high/40 rounded-3xl border border-white/10 animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-5 w-40 bg-white/10 rounded-md animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] rounded-xl bg-white/5 border border-white/5 animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-white/10 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
