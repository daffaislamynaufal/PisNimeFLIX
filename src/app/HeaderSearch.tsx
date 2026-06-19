'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="flex items-center">
      {/* Desktop Search Bar (Always visible on lg) */}
      <form 
        onSubmit={handleSubmit}
        className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:border-primary transition-all group w-64"
      >
        <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary">search</span>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari anime terfavorit..." 
          className="bg-transparent border-none focus:outline-none focus:ring-0 text-label-sm w-full placeholder:text-on-surface-variant/50 ml-2 text-on-surface"
          autoComplete="off"
          required
        />
      </form>

      {/* Mobile/Tablet Search Toggle Button (Hidden on lg) */}
      <div className="lg:hidden flex items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-full hover:bg-white/5 active:scale-95 transition-all text-on-surface flex items-center justify-center border border-white/5 bg-surface-container/30"
          aria-label="Cari Anime"
        >
          <span className="material-symbols-outlined text-xl">
            {isOpen ? 'close' : 'search'}
          </span>
        </button>

        {/* Mobile Full-Width Overlay Search Input */}
        {isOpen && (
          <div className="absolute left-0 top-[73px] w-full bg-background/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-xl z-50">
            <form onSubmit={handleSubmit} className="flex items-center bg-surface-container rounded-full px-4 py-3 border border-outline-variant focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input 
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anime terfavorit..." 
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-label-sm w-full placeholder:text-on-surface-variant/50 ml-2 text-on-surface"
                autoComplete="off"
                required
              />
              <button 
                type="submit" 
                className="primary-gradient px-4 py-1.5 rounded-full text-xs font-bold text-white ml-2 hover:opacity-90 active:scale-95 transition-all border-none cursor-pointer"
              >
                Cari
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
