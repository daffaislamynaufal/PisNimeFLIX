'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MovieSearchProps {
  initialQuery?: string;
}

export default function MovieSearch({ initialQuery = '' }: MovieSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movie-indo?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/movie-indo`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    router.push(`/movie-indo`);
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-8">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full self-start">
        <input
          type="text"
          placeholder="Cari film Indonesia (contoh: Vina, Dilan)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-high/40 border border-outline-variant/30 rounded-xl pl-12 pr-24 py-3 text-sm focus:outline-none focus:border-primary text-white placeholder:text-on-surface-variant/40 transition-colors backdrop-blur-md"
        />
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
          search
        </span>
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 primary-gradient px-4 py-1.5 rounded-lg text-white font-bold text-xs hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
        >
          Cari
        </button>
      </form>

      {/* Search Result Notification */}
      {initialQuery && (
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-primary font-semibold">
            Hasil pencarian untuk: &quot;{initialQuery}&quot;
            <button
              onClick={handleClear}
              className="bg-transparent border-none text-primary hover:text-white cursor-pointer flex items-center p-0 ml-1"
              title="Hapus Pencarian"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
