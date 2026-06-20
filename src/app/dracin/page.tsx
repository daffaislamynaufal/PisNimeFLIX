'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface DramaItem {
  id: string;
  dramaId?: string;
  title: string;
  cover: string;
  posterImg?: string;
  episodes?: number;
  totalEpisodes?: number;
  isCompleted?: string;
  defaultLanguage?: string;
  description?: string;
  synopsis?: string;
}

const SOURCES = [
  { value: 'dramabox', label: 'DramaBox' },
  { value: 'reelshort', label: 'ReelShort' },
  { value: 'shortmax', label: 'ShortMax' },
  { value: 'netshort', label: 'NetShort' },
  { value: 'goodshort', label: 'GoodShort' },
  { value: 'dramawave', label: 'DramaWave' },
  { value: 'flickreels', label: 'FlickReels' },
  { value: 'freereels', label: 'FreeReels' },
  { value: 'idrama', label: 'iDrama' },
  { value: 'dramanova', label: 'DramaNova' },
  { value: 'starshort', label: 'StarShort' },
  { value: 'dramabite', label: 'DramaBite' }
];

const CATEGORIES = [
  { value: 'foryou', label: 'For You' },
  { value: 'trending', label: 'Trending' },
  { value: 'hotrank', label: 'Hot Rank' },
  { value: 'recommended', label: 'Recommended' }
];

export default function DracinCatalogPage() {
  const [selectedSource, setSelectedSource] = useState('dramabox');
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'hotrank' | 'recommended'>('foryou');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dramaList, setDramaList] = useState<DramaItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDramas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/dracin?source=${selectedSource}`;
      if (searchTrigger) {
        url += `&type=search&q=${encodeURIComponent(searchTrigger)}`;
      } else {
        url += `&type=${activeTab}`;
        if (activeTab === 'foryou') {
          url += `&page=${currentPage}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Gagal memuat drama');
      }
      const data = await res.json();
      
      const items = data.items || data.rows || data.data || [];
      setDramaList(items);
      setHasMore(data.hasMore ?? false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data drama.');
    } finally {
      setLoading(false);
    }
  }, [selectedSource, activeTab, currentPage, searchTrigger]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchDramas();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchDramas]);

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    setCurrentPage(1);
    setSearchQuery('');
    setSearchTrigger('');
  };

  const handleTabChange = (tab: 'foryou' | 'trending' | 'hotrank' | 'recommended') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setSearchTrigger('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchTrigger(searchQuery);
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display-lg text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">live_tv</span>
              Koleksi <span className="text-transparent bg-clip-text primary-gradient">Dracin</span>
            </h1>
            <p className="font-body-md text-on-surface-variant mt-2 max-w-xl">
              Tonton Short Drama dari DramaBox, ReelShort, ShortMax, dan lainnya dengan subtitle Bahasa Indonesia.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <input
              type="text"
              placeholder={`Cari drama di ${SOURCES.find(s => s.value === selectedSource)?.label}...`}
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
        </div>

        {/* Filter Section */}
        <div className="w-full bg-surface-container-high/20 border border-outline-variant/20 rounded-2xl p-6 mb-8 backdrop-blur-md flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Sumber Platform</label>
              <div className="relative">
                <select 
                  value={selectedSource} 
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="w-full bg-surface-container-high/40 border border-outline-variant/30 text-white rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary backdrop-blur-md text-sm outline-none cursor-pointer appearance-none transition-all duration-300 hover:border-primary/50"
                >
                  {SOURCES.map((src) => (
                    <option key={src.value} value={src.value} className="bg-surface-container-highest text-white">
                      {src.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none text-lg">
                  unfold_more
                </span>
              </div>
            </div>
            
            {/* Category / Tab Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.value && !searchTrigger;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => handleTabChange(cat.value as 'foryou' | 'trending' | 'hotrank' | 'recommended')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-primary text-on-primary border-transparent shadow-lg shadow-primary/25'
                          : 'bg-surface-container-high/40 text-on-surface border-white/5 hover:border-primary/30'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {searchTrigger && (
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-8">
            <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-2 text-xs text-primary font-semibold font-body-md">
              Hasil pencarian untuk: &quot;{searchTrigger}&quot;
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchTrigger('');
                  fetchDramas();
                }}
                className="bg-transparent border-none text-primary hover:text-white cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-surface-container/30 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[2/3] bg-white/5"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2 h-4">
                      <div className="h-3 w-16 bg-white/10 rounded"></div>
                      <div className="h-3 w-8 bg-white/5 rounded"></div>
                    </div>
                    <div className="h-10 flex items-start">
                      <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  <div className="h-8 w-full bg-white/5 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center max-w-md mx-auto my-12">
            <span className="material-symbols-outlined text-4xl mb-2 text-red-500">error</span>
            <p className="font-semibold text-sm mb-4">{error}</p>
            <button
              onClick={fetchDramas}
              className="primary-gradient px-5 py-2 rounded-xl text-white font-bold text-xs border-none cursor-pointer hover:opacity-90 active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && dramaList.length === 0 && (
          <div className="text-center py-20 bg-surface-container/20 border border-white/5 rounded-3xl backdrop-blur-sm max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">
              search_off
            </span>
            <h3 className="text-white font-bold text-lg mb-2">Drama Tidak Ditemukan</h3>
            <p className="text-on-surface-variant text-sm px-6 leading-relaxed">
              Maaf, kami tidak dapat menemukan drama yang cocok pada platform ini. Coba ganti kata kunci pencarian Anda atau periksa filter Anda.
            </p>
          </div>
        )}

        {/* Grid Catalog */}
        {!loading && !error && dramaList.length > 0 && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {dramaList.map((drama) => {
                const id = drama.id || drama.dramaId || '';
                const coverUrl = drama.cover || drama.posterImg || '/placeholder.jpg';
                const totalEps = drama.totalEpisodes || drama.episodes || 0;
                
                return (
                  <div
                    key={id}
                    className="group bg-surface-container/30 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/40 hover:bg-surface-container/60 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                  >
                    <div>
                      {/* Poster Link */}
                      <Link href={`/dracin/${selectedSource}/${id}`} className="relative aspect-[2/3] block overflow-hidden bg-surface-container-high/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverUrl}
                          alt={drama.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                        
                        {/* Episode Count Badge */}
                        {totalEps > 0 && (
                          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm border border-white/10">
                            {totalEps} Eps
                          </span>
                        )}
                        
                        {/* Completion Badge */}
                        {drama.isCompleted === '1' && (
                          <span className="absolute top-3 right-3 bg-emerald-500/90 text-white px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm">
                            Tamat
                          </span>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant/60 font-semibold mb-2 h-4">
                          <span className="uppercase">{selectedSource}</span>
                          {drama.defaultLanguage && <span>{drama.defaultLanguage.toUpperCase()}</span>}
                        </div>

                        {/* Title Link */}
                        <Link href={`/dracin/${selectedSource}/${id}`} className="text-decoration-none block h-10">
                          <h3 className="font-bold text-sm text-white hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {drama.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Tonton Sekarang Button */}
                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                      <Link
                        href={`/dracin/${selectedSource}/${id}`}
                        className="text-decoration-none block text-center bg-surface-container-high/40 hover:bg-primary/20 border border-outline-variant/30 hover:border-primary/40 py-2 rounded-xl text-[10px] font-bold text-on-surface-variant hover:text-white transition-all"
                      >
                        Detail Drama
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (Only for 'foryou' tab and when not searching) */}
            {activeTab === 'foryou' && !searchTrigger && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="bg-surface-container/60 hover:bg-surface-container border border-white/10 disabled:opacity-40 disabled:pointer-events-none px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, hasMore ? currentPage + 2 : currentPage) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 2);
                    const pageNum = startPage + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-all cursor-pointer border-none ${
                          currentPage === pageNum
                            ? 'primary-gradient text-white shadow-md shadow-primary/10'
                            : 'bg-surface-container/40 text-on-surface-variant hover:text-white hover:bg-surface-container'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={!hasMore || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="bg-surface-container/60 hover:bg-surface-container border border-white/10 disabled:opacity-40 disabled:pointer-events-none px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  Selanjutnya
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
